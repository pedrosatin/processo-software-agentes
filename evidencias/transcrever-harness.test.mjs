import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const converter = async (eventos, sessao) => {
  const pasta = await mkdtemp(join(tmpdir(), 'transcricao-'))
  try {
    const arquivo = join(pasta, 'stream.jsonl')
    await writeFile(arquivo, eventos.map(e => JSON.stringify(e)).join('\n'))
    const argumentos = [new URL('./transcrever-harness.mjs', import.meta.url).pathname, arquivo]
    if (sessao) {
      const nativa = join(pasta, 'sessao.jsonl')
      await writeFile(nativa, sessao.map(e => JSON.stringify(e)).join('\n'))
      argumentos.push('modelo-do-ensaio', nativa)
    }
    return execFileSync(process.execPath, argumentos, { encoding: 'utf8' })
  } finally {
    await rm(pasta, { recursive: true, force: true })
  }
}

test('Codex preserva ferramentas e delegações, remove caminhos e IDs e omite raciocínio', async () => {
  const saida = await converter([
    { type: 'item.completed', item: { type: 'reasoning', text: 'raciocinio-privado' } },
    { type: 'item.completed', item: { type: 'mcp_tool_call', server: 'processo', tool: 'iniciar_etapa', arguments: { papel: 'spec' }, result: { estado: 'parado' } } },
    { type: 'item.completed', item: { type: 'collab_tool_call', tool: 'spawn_agent', receiver_thread_ids: ['id-opaco-privado'], prompt: 'mensagem-opaca-privada /home/aluno/projeto/spec.md' } }
  ])
  assert.match(saida, /processo.iniciar_etapa/)
  assert.match(saida, /spawn_agent/)
  assert.doesNotMatch(saida, /raciocinio-privado|\/home\/|id-opaco-privado|mensagem-opaca-privada/)
})

test('registro nativo exporta somente nomes dos papéis e omite argumentos opacos', async () => {
  const saida = await converter([], [
    { type: 'response_item', payload: { type: 'function_call', name: 'spawn_agent', arguments: JSON.stringify({ task_name: 'tester', agent_type: 'tester', message: 'mensagem-opaca-privada' }) } },
    { type: 'response_item', payload: { type: 'reasoning', text: 'raciocinio-privado' } }
  ])
  assert.match(saida, /"papel": "tester"/)
  assert.doesNotMatch(saida, /mensagem-opaca-privada|raciocinio-privado/)
})

test('agy preserva delegação e resultado sem metadados e protege cercas internas', async () => {
  const saida = await converter([
    { event: 'init', init: { model: 'modelo-do-ensaio' } },
    { event: 'step_update', step_update: { state: 'DONE', step_type: 'subagent', subagent_info: { subagents: [{ type_name: 'tester', initial_prompt: 'Leia a spec' }] } } },
    { event: 'result', result: { status: 'success', response: '```ts\nfiltrarTarefas\n```', conversation_id: 'identificador-privado', usage: { private: 'metadado-privado' } } }
  ])
  assert.match(saida, /Delegação: tester/)
  assert.match(saida, /````\n/)
  assert.doesNotMatch(saida, /identificador-privado|metadado-privado/)
})


test('instruções pessoais lidas fora do repositório ficam fora do extrato', async () => {
  const saida = await converter([
    { type: 'item.completed', item: { type: 'command_execution', command: 'cat AGENTS.md', exit_code: 0, aggregated_output: '# Contexto global\nInstrucoes pessoais reservadas' } }
  ])
  assert.match(saida, /Saída omitida/)
  assert.doesNotMatch(saida, /Instrucoes pessoais reservadas|# Contexto global/)
})
