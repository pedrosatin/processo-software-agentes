import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Agente, Caso, Processo, ResultadoCaso, ResultadoGate, Spec, Suite } from './contratos.js'
import { casosReferenciaSchema, casosTesterSchema, propostaSchema, specSchema } from './contratos.js'
import { avaliarGates } from './gates.js'
import type { Modo, Responder } from './modelo.js'
import { criarResponder } from './modelo.js'
import { registrar } from './registro.js'
import { executarSuite, transpilar } from './verificacao.js'

export type Encerramento = 'aprovado' | 'reprovado' | 'duvidas'

export type Resumo = {
  cenario: string
  rotulo: string
  modo: Modo
  modelo: string
  versaoAgentes: Record<Agente, string>
  encerramento: Encerramento
  tentativas: number
  chamadasAoModelo: number
  tester: string
  referencia: string
  falsoNegativo: boolean
  gates: Record<string, boolean>
  duracaoMs: number
}

export type Configuracao = {
  raiz: string
  processo: Processo
  pastaCenario: string
  pastaExecucao: string
  modo: Modo
  rotulo: string
}

const gravar = async (pasta: string, nome: string, conteudo: unknown): Promise<void> => {
  const texto = typeof conteudo === 'string' ? conteudo : JSON.stringify(conteudo, null, 2) + '\n'
  await writeFile(join(pasta, nome), texto, 'utf8')
}

// Seleciona os materiais do agente. Campos { "arquivo": "x" } viram o conteúdo do arquivo do cenário
const resolverContexto = async (pastaCenario: string, processo: Processo, agente: Agente): Promise<Record<string, unknown>> =>
  Object.fromEntries(await Promise.all(processo.contexto[agente].map(async nome => {
    const valor = processo.materiais[nome]
    const arquivo = (valor as { arquivo?: unknown } | null)?.arquivo
    return typeof arquivo === 'string' ? [nome, await readFile(join(pastaCenario, arquivo), 'utf8')] : [nome, valor]
  })))

const versaoCurta = (texto: string): string => createHash('sha256').update(texto).digest('hex').slice(0, 8)

const placar = (suite: Suite): string => `${suite.aprovados}/${suite.total}`

const lerRespostas = async (raiz: string): Promise<string> => {
  try {
    return (await readFile(join(raiz, 'entradas', 'respostas.md'), 'utf8')).trim()
  } catch {
    return ''
  }
}

const falhasParaCoder = (suite: Suite, revisao: ResultadoGate[]): ResultadoCaso[] => [
  ...suite.falhas,
  ...revisao.filter(gate => !gate.aprovado).map(gate => ({
    nome: `revisão ${gate.gate}`, criterio: gate.gate, aprovado: false, detalhe: gate.detalhes.join(' | ')
  }))
]

export const executarCiclo = async (configuracao: Configuracao): Promise<Resumo> => {
  const { raiz, processo, pastaCenario, pastaExecucao, modo, rotulo } = configuracao
  const inicio = performance.now()
  await mkdir(join(pastaExecucao, 'agentes'), { recursive: true })
  await mkdir(join(pastaExecucao, 'manual'), { recursive: true })

  // Gestão de configuração: cada execução guarda a versão das instruções usadas
  const instrucoes = Object.fromEntries(await Promise.all((['spec', 'coder', 'tester'] as const).map(async agente => {
    const origem = join(raiz, 'agentes', `${agente}.md`)
    await copyFile(origem, join(pastaExecucao, 'agentes', `${agente}.md`))
    return [agente, await readFile(origem, 'utf8')]
  }))) as Record<Agente, string>
  const versaoAgentes = Object.fromEntries(Object.entries(instrucoes).map(([agente, texto]) => [agente, versaoCurta(texto)])) as Record<Agente, string>
  const modelo = modo === 'api' ? (process.env.MODELO || 'gemini-flash-lite-latest') : modo
  await gravar(pastaExecucao, 'configuracao.json', { cenario: processo.id, rotulo, modo, modelo, versaoAgentes, processo })
  registrar({ evento: 'inicio', cenario: processo.id, rotulo, modo, versaoAgentes })

  const responder: Responder = criarResponder(modo, pastaCenario, pastaExecucao)
  const chamadas = { total: 0 }
  const chamar = async (agente: Agente, tentativa: number, entrada: unknown): Promise<unknown> => {
    chamadas.total += 1
    registrar({ evento: 'chamada', agente, tentativa })
    return await responder({ agente, tentativa, instrucoes: instrucoes[agente], entrada })
  }
  const resumir = async (encerramento: Encerramento, extra: Omit<Resumo, 'cenario' | 'rotulo' | 'modo' | 'modelo' | 'versaoAgentes' | 'encerramento' | 'chamadasAoModelo' | 'duracaoMs'>): Promise<Resumo> => {
    const resumo: Resumo = {
      cenario: processo.id, rotulo, modo, modelo, versaoAgentes, encerramento,
      chamadasAoModelo: chamadas.total, ...extra, duracaoMs: Math.round(performance.now() - inicio)
    }
    await gravar(pastaExecucao, 'resumo.json', resumo)
    registrar({ evento: 'fim', ...resumo })
    return resumo
  }

  // Comunicação e modelagem: o spec transforma o pedido em critérios verificáveis
  const spec: Spec = specSchema.parse(await chamar('spec', 0, {
    pedido: processo.pedido,
    tipoExistente: 'type Tarefa = { id: number, titulo: string, concluida: boolean }',
    assinaturaObrigatoria: 'filtrarTarefas(tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[]',
    estadosAceitos: ['todas', 'abertas', 'concluidas'],
    respostasAsDuvidas: await lerRespostas(raiz),
    ...await resolverContexto(pastaCenario, processo, 'spec')
  }))
  await gravar(pastaExecucao, 'spec.json', spec)
  if (spec.duvidas.length > 0) {
    registrar({ evento: 'duvidas', duvidas: spec.duvidas, orientacao: 'Responda em entradas/respostas.md e execute de novo' })
    return await resumir('duvidas', { tentativas: 0, tester: '-', referencia: '-', falsoNegativo: false, gates: {} })
  }

  // Construção em paralelo: tester e coder dependem só do spec
  const contextoCoder = await resolverContexto(pastaCenario, processo, 'coder')
  const pedirProposta = async (tentativa: number, falhas: ResultadoCaso[]): Promise<string> => {
    const proposta = propostaSchema.parse(await chamar('coder', tentativa, { spec, tentativa, falhas, ...contextoCoder }))
    const pasta = join(pastaExecucao, `tentativa-${tentativa}`)
    await mkdir(pasta, { recursive: true })
    await gravar(pasta, 'proposta.ts', proposta.codigo.trimEnd() + '\n')
    await gravar(pasta, 'explicacao.txt', proposta.explicacao + '\n')
    return proposta.codigo
  }
  const [casosBrutos, primeiraProposta] = await Promise.all([
    chamar('tester', 0, { spec, ...await resolverContexto(pastaCenario, processo, 'tester') }),
    pedirProposta(0, [])
  ])
  const casos: Caso[] = casosTesterSchema.parse(casosBrutos).casos
  await gravar(pastaExecucao, 'casos.json', { casos })

  // Ciclo iterativo com limite: a suíte do tester e a revisão automática voltam ao coder
  const executar = async (tentativa: number, codigo: string): Promise<{ suite: Suite, revisao: ResultadoGate[] }> => {
    const pasta = join(pastaExecucao, `tentativa-${tentativa}`)
    const modulo = await transpilar(codigo, join(pasta, 'proposta.mjs'))
    const suite = await executarSuite(modulo, casos)
    const revisao = await avaliarGates(processo.revisaoNoCiclo, { processo, pastaCenario, pastaExecucao: pasta, spec, casos, codigo })
    await gravar(pasta, 'resultado.json', { tester: suite, revisao })
    registrar({ evento: 'verificacao', tentativa, tester: placar(suite), revisao: Object.fromEntries(revisao.map(gate => [gate.gate, gate.aprovado])) })
    return { suite, revisao }
  }
  const percorrer = async (tentativa: number, codigo: string): Promise<{ tentativa: number, codigo: string, suite: Suite }> => {
    const { suite, revisao } = await executar(tentativa, codigo)
    const falhas = falhasParaCoder(suite, revisao)
    if (falhas.length === 0 || tentativa >= processo.limiteCorrecoes) return { tentativa, codigo, suite }
    return await percorrer(tentativa + 1, await pedirProposta(tentativa + 1, falhas))
  }
  const final = await percorrer(0, primeiraProposta)

  // Validação: a suíte de referência mede o resultado e não volta para o coder
  const pastaFinal = join(pastaExecucao, `tentativa-${final.tentativa}`)
  const referencia = casosReferenciaSchema.parse(JSON.parse(await readFile(join(raiz, 'cenarios', 'referencia.json'), 'utf8'))).casos
  const suiteReferencia = await executarSuite(join(pastaFinal, 'proposta.mjs'), referencia)
  await gravar(pastaExecucao, 'referencia.json', suiteReferencia)
  await copyFile(join(pastaFinal, 'proposta.ts'), join(pastaExecucao, 'proposta-final.ts'))

  // Critérios de saída do cenário, avaliados uma vez sobre o resultado final
  const gatesDoCenario = await avaliarGates(processo.gates, { processo, pastaCenario, pastaExecucao: pastaFinal, spec, casos, codigo: final.codigo })
  const maxTentativas = processo.parametros.maxTentativas
  const resultadoGates: ResultadoGate[] = maxTentativas === undefined ? gatesDoCenario : [...gatesDoCenario, {
    gate: 'tentativas',
    aprovado: final.tentativa + 1 <= maxTentativas,
    detalhes: [`${final.tentativa + 1} tentativa(s) do coder, limite ${maxTentativas}`]
  }]
  await gravar(pastaExecucao, 'gates.json', resultadoGates)
  resultadoGates.forEach(gate => registrar({ evento: 'gate', ...gate }))

  const aprovadoPeloTester = final.suite.falhas.length === 0
  const aprovado = aprovadoPeloTester && resultadoGates.every(gate => gate.aprovado)
  return await resumir(aprovado ? 'aprovado' : 'reprovado', {
    tentativas: final.tentativa + 1,
    tester: placar(final.suite),
    referencia: placar(suiteReferencia),
    falsoNegativo: aprovadoPeloTester && suiteReferencia.falhas.length > 0,
    gates: Object.fromEntries(resultadoGates.map(gate => [gate.gate, gate.aprovado]))
  })
}
