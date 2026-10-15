import { mkdir, readdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { z } from 'zod'
import type { Resumo } from './ciclo.js'
import { executarCiclo } from './ciclo.js'
import { processoSchema } from './contratos.js'
import type { Processo } from './contratos.js'
import { gravarEventosEm } from './registro.js'

const raiz = resolve(process.env.RAIZ_ATIVIDADE ?? '.')
const pastaArtefatos = resolve(process.env.ARTEFATOS_DIR ?? join(raiz, 'artefatos'))

const ajuda = `Uso:
  processo cenarios
  processo executar --cenario 2 --rotulo antes [--modo demonstracao|api|manual]
  processo comparar --cenario 2

O modo também pode vir da variável MODO. O padrão é demonstracao.`

const listarCenarios = async (): Promise<string[]> =>
  (await readdir(join(raiz, 'cenarios'), { withFileTypes: true }))
    .filter(entrada => entrada.isDirectory())
    .map(entrada => entrada.name)
    .sort()

// Aceita "2", "02" ou o nome completo da pasta
const encontrarCenario = async (valor: string | undefined): Promise<string> => {
  if (!valor) throw new Error('Informe --cenario. Veja a lista com: processo cenarios')
  const cenarios = await listarCenarios()
  const numero = /^\d+$/.test(valor) ? valor.padStart(2, '0') : undefined
  const encontrado = cenarios.find(nome => nome === valor || (numero !== undefined && nome.startsWith(`${numero}-`)))
  if (!encontrado) throw new Error(`Cenário ${valor} não encontrado. Disponíveis: ${cenarios.join(', ')}`)
  return encontrado
}

const lerProcesso = async (cenario: string): Promise<Processo> =>
  processoSchema.parse(JSON.parse(await readFile(join(raiz, 'cenarios', cenario, 'processo.json'), 'utf8')))

// Data e hora locais, no fuso definido pela variável TZ
const carimbo = (agora: Date = new Date()): string => {
  const dois = (valor: number): string => String(valor).padStart(2, '0')
  const data = `${agora.getFullYear()}${dois(agora.getMonth() + 1)}${dois(agora.getDate())}`
  return `${data}-${dois(agora.getHours())}${dois(agora.getMinutes())}${dois(agora.getSeconds())}`
}

const executar = async (valores: Record<string, string | undefined>): Promise<number> => {
  const cenario = await encontrarCenario(valores.cenario)
  const processo = await lerProcesso(cenario)
  const modo = z.enum(['demonstracao', 'api', 'manual']).parse(valores.modo ?? process.env.MODO ?? 'demonstracao')
  const rotulo = z.string().regex(/^[a-z0-9-]+$/, 'Rótulo usa letras minúsculas, números e hífen').parse(valores.rotulo ?? 'execucao')
  const pastaExecucao = join(pastaArtefatos, cenario, `${carimbo()}-${rotulo}`)
  await mkdir(pastaExecucao, { recursive: true })
  gravarEventosEm(join(pastaExecucao, 'eventos.jsonl'))
  const resumo = await executarCiclo({ raiz, processo, pastaCenario: join(raiz, 'cenarios', cenario), pastaExecucao, modo, rotulo })
  console.log(`\nExecução gravada em ${pastaExecucao}`)
  console.table([linhaDoResumo(resumo)])
  const codigos: Record<Resumo['encerramento'], number> = { aprovado: 0, reprovado: 1, duvidas: 3 }
  return codigos[resumo.encerramento]
}

const linhaDoResumo = (resumo: Resumo): Record<string, string | number> => ({
  rotulo: resumo.rotulo,
  modo: resumo.modo,
  agentes: `${resumo.versaoAgentes.spec} ${resumo.versaoAgentes.coder} ${resumo.versaoAgentes.tester}`,
  encerramento: resumo.encerramento,
  tentativas: resumo.tentativas,
  chamadas: resumo.chamadasAoModelo,
  tester: resumo.tester,
  referencia: resumo.referencia,
  gates: Object.entries(resumo.gates).map(([gate, ok]) => `${gate}=${ok ? 'ok' : 'falhou'}`).join(' ') || '-',
  ms: resumo.duracaoMs
})

// Lista as execuções do cenário em ordem, uma linha por resumo.json
const comparar = async (valores: Record<string, string | undefined>): Promise<number> => {
  const cenario = await encontrarCenario(valores.cenario)
  const pasta = join(pastaArtefatos, cenario)
  const execucoes = (await readdir(pasta).catch(() => [] as string[])).sort()
  const resumos = await Promise.all(execucoes.map(async nome => {
    try {
      return JSON.parse(await readFile(join(pasta, nome, 'resumo.json'), 'utf8')) as Resumo
    } catch {
      return undefined
    }
  }))
  const linhas = resumos.filter((resumo): resumo is Resumo => resumo !== undefined).map(linhaDoResumo)
  if (linhas.length === 0) console.log(`Nenhuma execução concluída em ${pasta}`)
  else console.table(linhas)
  return 0
}

const principal = async (): Promise<number> => {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: { cenario: { type: 'string' }, rotulo: { type: 'string' }, modo: { type: 'string' }, ajuda: { type: 'boolean' } }
  })
  const comando = positionals[0] ?? 'executar'
  const valores = { cenario: values.cenario, rotulo: values.rotulo, modo: values.modo }
  if (values.ajuda) {
    console.log(ajuda)
    return 0
  }
  if (comando === 'cenarios') {
    const cenarios = await listarCenarios()
    const processos = await Promise.all(cenarios.map(lerProcesso))
    console.table(processos.map(processo => ({ cenario: processo.id, titulo: processo.titulo, gates: processo.gates.join(', ') })))
    return 0
  }
  if (comando === 'executar') return await executar(valores)
  if (comando === 'comparar') return await comparar(valores)
  console.log(ajuda)
  return 2
}

try {
  process.exitCode = await principal()
} catch (erro) {
  console.error(JSON.stringify({ evento: 'erro', mensagem: erro instanceof Error ? erro.message : 'Falha desconhecida' }))
  process.exitCode = 2
}
