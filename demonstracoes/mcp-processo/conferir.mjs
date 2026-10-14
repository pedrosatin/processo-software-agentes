// Confere o servidor sem modelo. Faz o papel do host e envia artefatos fixos
// numa pasta temporária dentro desta demonstração.
import { spawn } from 'node:child_process'
import { cp, mkdtemp, rm } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const aqui = dirname(fileURLToPath(import.meta.url))
const pasta = await mkdtemp(join(aqui, '.conferencia-'))
await cp(join(aqui, 'pedido.md'), join(pasta, 'pedido.md'))

const servidor = spawn(process.execPath, [join(aqui, 'server.mjs'), pasta], { stdio: ['pipe', 'pipe', 'inherit'] })
const linhas = createInterface({ input: servidor.stdout })[Symbol.asyncIterator]()
let proximoId = 0
const enviar = async (method, params) => {
  const id = ++proximoId
  servidor.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n')
  const { value } = await linhas.next()
  return JSON.parse(value).result
}
const chamar = async (name, args = {}) => {
  const result = await enviar('tools/call', { name, arguments: args })
  return { recusado: result.isError, dados: result.isError ? result.content[0].text : JSON.parse(result.content[0].text) }
}

const criterios = [
  { id: 'C01', texto: 'Com estado "abertas", retorna só as tarefas não concluídas.' },
  { id: 'C02', texto: 'O termo encontra o título sem diferenciar maiúsculas e minúsculas. "REVISAR" encontra "Revisar código".' },
  { id: 'C03', texto: 'Estado fora da lista lança o erro "Estado inválido".' }
]
const tarefas = [{ id: 1, titulo: 'Revisar código', concluida: false }, { id: 2, titulo: 'Relatório', concluida: true }]
const casos = [
  { nome: 'abertas', criterio: 'C01', tarefas, filtro: { estado: 'abertas' }, esperadoIds: [1] },
  { nome: 'maiúsculas', criterio: 'C02', tarefas, filtro: { estado: 'todas', termo: 'REVISAR' }, esperadoIds: [1] },
  { nome: 'estado inválido', criterio: 'C03', tarefas: [], filtro: { estado: 'arquivadas' }, esperadoErro: 'Estado inválido' }
]
const codigo = comparacao => `export type Tarefa = { id: number, titulo: string, concluida: boolean }
const estados: Record<string, (t: Tarefa) => boolean> = { todas: () => true, abertas: t => !t.concluida, concluidas: t => t.concluida }
export const filtrarTarefas = (tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[] => {
  const porEstado = Object.hasOwn(estados, filtro.estado) ? estados[filtro.estado] : null
  if (!porEstado) throw new Error('Estado inválido')
  const termo = (filtro.termo ?? '').trim()
  return tarefas.filter(t => porEstado(t) && ${comparacao})
}
`

const controles = []
const conferir = (nome, condicao) => controles.push({ nome, passou: Boolean(condicao) })

try {
  const inicio = await enviar('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'conferir', version: '1.0.0' } })
  servidor.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n')
  conferir('inicialização', inicio.serverInfo.name === 'processo')
  conferir('cinco ferramentas', (await enviar('tools/list', {})).tools.length === 5)
  conferir('coder recusado antes da especificação', (await chamar('iniciar_etapa', { papel: 'coder' })).recusado)
  const comDuvida = await chamar('entregar_spec', { criterios, duvidas: ['"relatorio" encontra "Relatório"?'] })
  conferir('dúvida para o processo', comDuvida.dados.estado === 'parado')
  conferir('tester recusado com dúvida aberta', (await chamar('iniciar_etapa', { papel: 'tester' })).recusado)
  conferir('IDs fora de sequência recusados', (await chamar('entregar_spec', { criterios: criterios.slice(1), duvidas: [] })).recusado)
  conferir('especificação aprovada', (await chamar('entregar_spec', { criterios, duvidas: [] })).dados.estado === 'aprovado')
  const tester = (await chamar('iniciar_etapa', { papel: 'tester' })).dados
  conferir('tester recebe só a especificação', Object.keys(tester.contexto).join() === 'especificacao')
  conferir('caso com critério desconhecido recusado', (await chamar('entregar_casos', { casos: [{ ...casos[0], criterio: 'C09' }] })).recusado)
  await chamar('entregar_casos', { casos })
  await chamar('entregar_codigo', { codigo: codigo('t.titulo.includes(termo)') })
  conferir('defeito de maiúsculas detectado', (await chamar('executar_testes')).dados.aprovado === false)
  conferir('coder recebe as falhas', (await chamar('iniciar_etapa', { papel: 'coder' })).dados.contexto.falhas.includes('C02'))
  await chamar('entregar_codigo', { codigo: codigo('t.titulo.toLowerCase().includes(termo.toLowerCase())') })
  conferir('correção aprovada', (await chamar('executar_testes')).dados.aprovado === true)
} finally {
  servidor.kill()
  await rm(pasta, { recursive: true, force: true })
}

controles.forEach(c => console.log(`${c.passou ? 'ok   ' : 'falha'} ${c.nome}`))
process.exitCode = controles.every(c => c.passou) ? 0 : 1
