import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { test } from 'node:test'
import { executarSuite, transpilar } from '../src/verificacao.js'
import { casosTesterSchema, specSchema } from '../src/contratos.js'
import type { Caso } from '../src/contratos.js'

const pasta = join(process.cwd(), 'artefatos', 'testes-verificacao')
await mkdir(pasta, { recursive: true })
const caso: Caso = {
  nome: 'Tarefas com IDs repetidos e conteúdos diferentes', criterio: 'Preservar itens',
  tarefas: [{ id: 1, titulo: 'A', concluida: false }, { id: 1, titulo: 'B', concluida: true }],
  filtro: { estado: 'todas' }, esperadoIds: [1, 1]
}
const avaliar = async (codigo: string, nome: string) =>
  await executarSuite(await transpilar(codigo, join(pasta, `${nome}.mjs`)), [caso])

test('preserva tarefas diferentes com o mesmo ID', async () => {
  assert.equal((await avaliar('export const filtrarTarefas = (tarefas) => tarefas.filter(() => true)', 'duplicados')).aprovados, 1)
})
test('reprova alteração da entrada', async () => {
  const suite = await avaliar('export const filtrarTarefas = (tarefas) => { tarefas[0].titulo = "alterado"; return tarefas }', 'mutacao')
  assert.match(suite.falhas[0].detalhe, /entrada foi alterada/)
})
test('reprova módulo sem a função exportada', async () => {
  assert.match((await avaliar('export const outra = () => []', 'exportacao')).falhas[0].detalhe, /não exporta/)
})
test('bloqueia tentativa de escrita em arquivo', async () => {
  const suite = await avaliar('import { writeFileSync } from "node:fs"\nexport const filtrarTarefas = (tarefas) => { writeFileSync("arquivo-proibido", "x"); return tarefas }', 'escrita')
  assert.equal(suite.aprovados, 0)
  assert.match(suite.falhas[0].detalhe, /restricted|restrit|denied/i)
})
test('bloqueia criação de processo', async () => {
  const suite = await avaliar('import { execFileSync } from "node:child_process"\nexport const filtrarTarefas = (tarefas) => { execFileSync(process.execPath, ["--version"]); return tarefas }', 'processo')
  assert.equal(suite.aprovados, 0)
  assert.match(suite.falhas[0].detalhe, /restricted|restrit|denied/i)
})
test('filho não recebe variáveis de chave do processo pai', async () => {
  process.env.CHAVE_TESTE_AULA = 'marcador-sem-segredo'
  try {
    const suite = await avaliar('export const filtrarTarefas = (tarefas) => { if (process.env.CHAVE_TESTE_AULA) throw Error("Chave recebida"); return tarefas }', 'ambiente')
    assert.equal(suite.aprovados, 1)
  } finally { delete process.env.CHAVE_TESTE_AULA }
})
test('encerra código que permanece em laço', { timeout: 15000 }, async () => {
  const inicio = performance.now()
  const suite = await avaliar('export const filtrarTarefas = () => { while (true) {} }', 'prazo')
  assert.equal(suite.aprovados, 0)
  assert.ok(performance.now() - inicio < 14500)
})
test('rejeita spec com critérios ausentes', () => {
  assert.equal(specSchema.safeParse({ requisito: 'r', assinatura: 'a', criterios: [], duvidas: [] }).success, false)
})
test('rejeita caso com dois resultados esperados', () => {
  const ambiguo = { ...caso, esperadoErro: 'Erro' }
  assert.equal(casosTesterSchema.safeParse({ casos: Array(5).fill(ambiguo) }).success, false)
})
