import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, rm, readdir } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import { test } from 'node:test'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = dirname(fileURLToPath(import.meta.url))

// Usa o transporte real para conferir que argumentos inválidos não chegam à gravação.
test('MCP recusa violações do inputSchema e preserva a operação válida', async () => {
  const pasta = await mkdtemp(join(raiz, '.conferencia-'))
  const filho = spawn(process.execPath, [join(raiz, 'server.mjs'), pasta], { stdio: ['pipe', 'pipe', 'inherit'] })
  const linhas = createInterface({ input: filho.stdout })[Symbol.asyncIterator]()
  let id = 0
  const enviar = async (method, params) => {
    filho.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }) + '\n')
    const linha = await linhas.next()
    assert.equal(linha.done, false)
    return JSON.parse(linha.value)
  }
  const spec = { criterios: [{ id: 'C01', texto: 'Estado todas retorna todas as tarefas.' }], duvidas: [] }
  try {
    await enviar('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'teste-contratos', version: '1.0.0' } })
    filho.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n')
    const invalidos = [
      ['entregar_spec', { criterios: [], duvidas: [] }],
      ['entregar_spec', { criterios: spec.criterios }],
      ['entregar_spec', { ...spec, duvidas: [123] }],
      ['entregar_spec', { ...spec, extra: true }],
      ['iniciar_etapa', { papel: 'outro' }],
      ['iniciar_etapa', null],
      ['entregar_codigo', { codigo: 123 }],
      ['entregar_casos', { casos: [{ nome: 'tipos', criterio: 'C01', tarefas: [{ id: '1', titulo: 'Tarefa', concluida: false }], filtro: { estado: 'todas' }, esperadoIds: [1] }] }]
    ]
    for (const [name, argumentos] of invalidos) {
      const resposta = await enviar('tools/call', { name, arguments: argumentos })
      assert.equal(resposta.error?.code, -32602, `${name}: ${JSON.stringify(argumentos)}`)
    }
    assert.deepEqual(await readdir(pasta), [])
    const valida = await enviar('tools/call', { name: 'entregar_spec', arguments: spec })
    assert.equal(valida.result.isError, false)
    assert.equal(JSON.parse(valida.result.content[0].text).estado, 'aprovado')
    const ping = await enviar('ping', {})
    assert.deepEqual(ping.result, {})
  } finally {
    filho.kill()
    await rm(pasta, { recursive: true, force: true })
  }
})
