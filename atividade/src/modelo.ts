import { access, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { z } from 'zod'
import type { Agente } from './contratos.js'
import { registrar } from './registro.js'

export type Modo = 'demonstracao' | 'api' | 'manual'

export type Chamada = { agente: Agente, tentativa: number, instrucoes: string, entrada: unknown }
export type Responder = (chamada: Chamada) => Promise<unknown>

export const extrairJson = (texto: string): unknown => {
  const semCerca = texto.trim().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
  return JSON.parse(semCerca) as unknown
}

const esperar = async (ms: number): Promise<void> => await new Promise(resolver => setTimeout(resolver, ms))

const existe = async (caminho: string): Promise<boolean> => {
  try {
    await access(caminho)
    return true
  } catch {
    return false
  }
}

const respostaSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1),
  usage: z.object({ prompt_tokens: z.number(), completion_tokens: z.number() }).partial().optional()
})

// 429 e 503 indicam limite ou sobrecarga do provedor e podem passar após uma pausa
const enviarComRetentativa = async (url: string, requisicao: RequestInit): Promise<Response> => {
  const pausasMs = [2000, 5000, 10000]
  for (let tentativa = 0; ; tentativa++) {
    const resposta = await fetch(url, { ...requisicao, signal: AbortSignal.timeout(60000) })
    const temporario = resposta.status === 429 || resposta.status === 503
    if (!temporario || tentativa >= pausasMs.length) return resposta
    registrar({ evento: 'retentativa', status: resposta.status, aguardarMs: pausasMs[tentativa] })
    await esperar(pausasMs[tentativa])
  }
}

const listaModelosSchema = z.object({ data: z.array(z.object({ id: z.string() })) })

// A listagem confirma disponibilidade, mas não garante gratuidade ou cota para a conta
export const escolherModelo = (ids: string[]): string | undefined => {
  const candidatos = ids.flatMap(id => {
    const nome = id.replace(/^models\//, '')
    const partes = /^gemini-(\d+(?:\.\d+)*)-flash(-lite)?(?:-\d{3})?$/.exec(nome)
    return partes ? [{ nome, versao: partes[1].split('.').map(Number), lite: Boolean(partes[2]) }] : []
  })
  candidatos.sort((a, b) => {
    if (a.lite !== b.lite) return a.lite ? -1 : 1
    for (let i = 0; i < Math.max(a.versao.length, b.versao.length); i++) {
      const diferenca = (b.versao[i] ?? 0) - (a.versao[i] ?? 0)
      if (diferenca) return diferenca
    }
    return a.nome.localeCompare(b.nome)
  })
  return candidatos[0]?.nome
}

const viaApi = (): Responder => {
  const chave = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY
  if (!chave) throw new Error('MODO=api exige GEMINI_API_KEY ou LLM_API_KEY no ambiente')
  const base = (process.env.LLM_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai').replace(/\/$/, '')
  const cabecalhos = { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' }
  const modeloPadrao = 'gemini-flash-lite-latest'
  const permiteSubstituicao = (!process.env.MODELO || process.env.MODELO === modeloPadrao) && !process.env.LLM_BASE_URL
  let modelo = process.env.MODELO || modeloPadrao
  let formatoJson = true

  let descoberta: Promise<boolean> | undefined
  const descobrirModelo = async (): Promise<boolean> => {
    const resposta = await fetch(`${base}/models`, { headers: cabecalhos, signal: AbortSignal.timeout(30000) })
    if (!resposta.ok) return false
    const lista = listaModelosSchema.safeParse(await resposta.json())
    const novo = lista.success ? escolherModelo(lista.data.data.map(item => item.id)) : undefined
    if (!novo || novo === modelo) return false
    registrar({ evento: 'modelo-substituido', anterior: modelo, novo, aviso: 'Listagem não garante gratuidade ou cota para a conta' })
    modelo = novo
    return true
  }

  const enviar = async (instrucoes: string, entrada: unknown): Promise<Response> =>
    await enviarComRetentativa(`${base}/chat/completions`, {
      method: 'POST',
      headers: cabecalhos,
      body: JSON.stringify({
        model: modelo,
        temperature: 0.2,
        ...(formatoJson ? { response_format: { type: 'json_object' } } : {}),
        messages: [
          { role: 'system', content: instrucoes },
          { role: 'user', content: JSON.stringify(entrada) }
        ]
      })
    })

  return async ({ agente, instrucoes, entrada }) => {
    const modeloEnviado = modelo
    let resposta = await enviar(instrucoes, entrada)
    if (resposta.status === 404) {
      if (!permiteSubstituicao) {
        throw new Error(`Provedor respondeu HTTP 404: modelo ou endpoint configurado não encontrado; revise MODELO e LLM_BASE_URL. Nenhum modelo foi substituído. ${(await resposta.text()).slice(0, 300)}`)
      }
      // Chamadas paralelas compartilham a descoberta e repetem com o modelo resolvido
      if (modeloEnviado !== modelo || await (descoberta ??= descobrirModelo())) resposta = await enviar(instrucoes, entrada)
    }
    if (resposta.status === 400) {
      const erro = await resposta.text()
      if (!/response_format|json_object|mime/i.test(erro)) throw new Error(`Provedor respondeu HTTP 400: ${erro.slice(0, 300)}`)
      registrar({ evento: 'formato-json-desligado', detalhe: erro.slice(0, 200) })
      formatoJson = false
      resposta = await enviar(instrucoes, entrada)
    }
    if (!resposta.ok) throw new Error(`Provedor respondeu HTTP ${resposta.status}: ${(await resposta.text()).slice(0, 300)}`)
    const corpo = respostaSchema.parse(await resposta.json())
    registrar({ evento: 'uso', agente, modelo, tokensEntrada: corpo.usage?.prompt_tokens, tokensSaida: corpo.usage?.completion_tokens })
    return extrairJson(corpo.choices[0].message.content)
  }
}

// Respostas gravadas do cenário. coder-1.json vale para a tentativa 1, coder.json para as demais
const viaGravadas = (pastaCenario: string): Responder => async ({ agente, tentativa }) => {
  const especifica = join(pastaCenario, 'gravadas', `${agente}-${tentativa}.json`)
  const geral = join(pastaCenario, 'gravadas', `${agente}.json`)
  const arquivo = await existe(especifica) ? especifica : geral
  return JSON.parse(await readFile(arquivo, 'utf8')) as unknown
}

// O aluno cola o pedido em um chat de modelo e salva a resposta no arquivo indicado
const viaArquivos = (pastaExecucao: string): Responder => async ({ agente, tentativa, instrucoes, entrada }) => {
  const nome = `${agente}-${tentativa}`
  const pedido = join(pastaExecucao, 'manual', `${nome}-pedido.md`)
  const resposta = join(pastaExecucao, 'manual', `${nome}-resposta.json`)
  const texto = `${instrucoes.trim()}\n\nEntrada:\n\n${JSON.stringify(entrada, null, 2)}\n`
  await writeFile(pedido, texto, 'utf8')
  registrar({ evento: 'aguardando-resposta', agente, pedido, resposta })
  const limite = Date.now() + 20 * 60 * 1000
  while (Date.now() < limite) {
    if (await existe(resposta)) {
      try {
        return extrairJson(await readFile(resposta, 'utf8'))
      } catch {
        await esperar(1000)
        continue
      }
    }
    await esperar(1000)
  }
  throw new Error(`Sem resposta em ${resposta} após 20 minutos`)
}

// Factory: o modo escolhido define de onde vêm as respostas. Contratos e gates não mudam
export const criarResponder = (modo: Modo, pastaCenario: string, pastaExecucao: string): Responder => {
  const fabricas: Record<Modo, () => Responder> = {
    api: viaApi,
    demonstracao: () => viaGravadas(pastaCenario),
    manual: () => viaArquivos(pastaExecucao)
  }
  return fabricas[modo]()
}
