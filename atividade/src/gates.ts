import { readdir, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import type { Caso, Processo, ResultadoGate, Spec } from './contratos.js'
import { executarSuite, transpilar } from './verificacao.js'

// Tudo que um gate pode consultar sobre a execução
export type Insumos = {
  processo: Processo
  pastaCenario: string
  pastaExecucao: string
  spec: Spec
  casos: Caso[]
  codigo: string
}

export type Gate = (insumos: Insumos) => Promise<ResultadoGate>

const idDoCriterio = (texto: string): string | undefined => /^\s*(C\d+)\b/.exec(texto)?.[1]

// Cada critério do spec tem ID, cada caso cita um ID existente e todo ID tem caso
const rastreabilidade: Gate = async ({ spec, casos }) => {
  const detalhes: string[] = []
  const ids = spec.criterios.map(idDoCriterio)
  spec.criterios.forEach((criterio, i) => {
    if (!ids[i]) detalhes.push(`Critério sem ID no início: "${criterio.slice(0, 60)}"`)
  })
  const validos = new Set(ids.filter((id): id is string => id !== undefined))
  if (validos.size !== ids.filter(Boolean).length) detalhes.push('Há IDs de critério repetidos')
  if (spec.criterios.length > 5) detalhes.push(`O spec tem ${spec.criterios.length} critérios e o tester entrega cinco casos`)
  const cobertos = new Set<string>()
  casos.forEach(caso => {
    const id = idDoCriterio(caso.criterio)
    if (!id || !validos.has(id)) detalhes.push(`Caso "${caso.nome}" não cita um ID de critério existente`)
    else cobertos.add(id)
  })
  validos.forEach(id => {
    if (!cobertos.has(id)) detalhes.push(`Critério ${id} sem caso de teste`)
  })
  return { gate: 'rastreabilidade', aprovado: detalhes.length === 0, detalhes }
}

// Os casos do tester precisam reproduzir o defeito relatado na versão atual
const regressao: Gate = async ({ pastaCenario, pastaExecucao, casos }) => {
  const atual = await readFile(join(pastaCenario, 'versao-atual.ts'), 'utf8')
  const modulo = await transpilar(atual, join(pastaExecucao, 'versao-atual.mjs'))
  const suite = await executarSuite(modulo, casos)
  const pegaram = suite.falhas.map(falha => falha.nome)
  return pegaram.length > 0
    ? { gate: 'regressao', aprovado: true, detalhes: [`Casos que falham na versão atual: ${pegaram.join(', ')}`] }
    : { gate: 'regressao', aprovado: false, detalhes: ['Os cinco casos passam na versão atual, então nenhum reproduz o defeito relatado'] }
}

const linhasDeCodigo = (texto: string): string[] =>
  texto.split('\n').map(linha => linha.trim()).filter(linha => linha !== '' && !linha.startsWith('//'))

// Linhas removidas mais linhas adicionadas, pela maior subsequência comum
export const linhasAlteradas = (antes: string[], depois: string[]): number => {
  const tabela = antes.map(() => depois.map(() => 0))
  const valor = (i: number, j: number): number => (i < 0 || j < 0 ? 0 : tabela[i][j])
  antes.forEach((linhaA, i) => depois.forEach((linhaB, j) => {
    tabela[i][j] = linhaA === linhaB ? valor(i - 1, j - 1) + 1 : Math.max(valor(i - 1, j), valor(i, j - 1))
  }))
  const comuns = valor(antes.length - 1, depois.length - 1)
  return antes.length - comuns + depois.length - comuns
}

const mudancaMinima: Gate = async ({ pastaCenario, processo, codigo }) => {
  const limite = processo.parametros.maxLinhasAlteradas ?? 6
  const atual = await readFile(join(pastaCenario, 'versao-atual.ts'), 'utf8')
  const total = linhasAlteradas(linhasDeCodigo(atual), linhasDeCodigo(codigo))
  return {
    gate: 'mudanca-minima',
    aprovado: total <= limite,
    detalhes: [`${total} linhas alteradas em relação à versão atual, limite ${limite}`]
  }
}

const regrasDoPadrao: Array<{ regra: string, viola: (linha: string) => boolean }> = [
  { regra: 'sem class', viola: linha => /\bclass\s+\w/.test(linha) },
  { regra: 'sem ponto e vírgula no fim da linha', viola: linha => /;\s*$/.test(linha) },
  { regra: 'sem let ou var', viola: linha => /\b(let|var)\s+\w/.test(linha) },
  { regra: 'sem any', viola: linha => /(:|as)\s*any\b/.test(linha) },
  { regra: 'sem laço for ou while', viola: linha => /\b(for|while)\s*\(/.test(linha) },
  { regra: 'sem push, splice, sort ou reverse', viola: linha => /\.(push|splice|sort|reverse)\(/.test(linha) }
]

// Revisão automática do padrão de código da equipe, linha a linha
const padraoCodigo: Gate = async ({ processo, codigo }) => {
  const limite = processo.parametros.maxLinhas ?? 20
  const linhas = linhasDeCodigo(codigo)
  const detalhes = regrasDoPadrao.flatMap(({ regra, viola }) => {
    const ocorrencias = linhas.filter(viola)
    return ocorrencias.length > 0 ? [`Viola "${regra}" em ${ocorrencias.length} linha(s), por exemplo: ${ocorrencias[0]}`] : []
  })
  if (linhas.length > limite) detalhes.push(`Módulo com ${linhas.length} linhas de código, limite ${limite}`)
  return { gate: 'padrao-codigo', aprovado: detalhes.length === 0, detalhes }
}

// Cada mutante é uma implementação com um defeito conhecido. Morre quando algum caso falha
const mutantes: Gate = async ({ pastaCenario, pastaExecucao, processo, casos }) => {
  const minimo = processo.parametros.minMutantesMortos ?? 5
  const pasta = join(pastaCenario, 'mutantes')
  const arquivos = (await readdir(pasta)).filter(nome => nome.endsWith('.ts')).sort()
  const resultados = await Promise.all(arquivos.map(async arquivo => {
    const modulo = await transpilar(await readFile(join(pasta, arquivo), 'utf8'), join(pastaExecucao, `${basename(arquivo, '.ts')}.mjs`))
    const suite = await executarSuite(modulo, casos)
    return { mutante: basename(arquivo, '.ts'), morto: suite.falhas.length > 0 }
  }))
  const mortos = resultados.filter(resultado => resultado.morto).length
  return {
    gate: 'mutantes',
    aprovado: mortos >= minimo,
    detalhes: [
      `${mortos} de ${resultados.length} mutantes mortos, mínimo ${minimo}`,
      ...resultados.filter(resultado => !resultado.morto).map(resultado => `Sobreviveu: ${resultado.mutante}`)
    ]
  }
}

// Mapa de estratégias. O processo do cenário escolhe os gates pelo nome
export const gates: Record<string, Gate> = {
  rastreabilidade,
  regressao,
  'mudanca-minima': mudancaMinima,
  'padrao-codigo': padraoCodigo,
  mutantes
}

export const avaliarGates = async (nomes: string[], insumos: Insumos): Promise<ResultadoGate[]> =>
  await Promise.all(nomes.map(async nome => {
    const gate = gates[nome]
    if (!gate) return { gate: nome, aprovado: false, detalhes: ['Gate desconhecido'] }
    try {
      return await gate(insumos)
    } catch (erro) {
      return { gate: nome, aprovado: false, detalhes: [erro instanceof Error ? erro.message : 'Falha desconhecida'] }
    }
  }))
