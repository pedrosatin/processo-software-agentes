import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { test, type TestContext } from 'node:test'
import { criarResponder, escolherModelo } from '../src/modelo.js'

type Pedido = { caminho: string, corpo: Record<string, unknown> }

const preparar = async (t: TestContext, modelos: string[], aceitaJson: boolean, opcoes: { modelo?: string, baseCustomizada?: boolean, recusaSemFormato?: boolean } = {}) => {
  const pedidos: Pedido[] = []
  const servidor = createServer((req, res) => {
    let texto = ''
    req.on('data', parte => { texto += parte })
    req.on('end', () => {
      const corpo = texto ? JSON.parse(texto) as Record<string, unknown> : {}
      pedidos.push({ caminho: req.url ?? '', corpo })
      const responder = (status: number, valor: unknown) => {
        res.writeHead(status, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(valor))
      }
      if (req.url === '/models') return responder(200, { data: modelos.map(id => ({ id: `models/${id}` })) })
      if (!modelos.includes(String(corpo.model))) return responder(404, { error: 'model not found' })
      if (corpo.response_format && !aceitaJson) return responder(400, { error: 'response_format json_object is not supported' })
      if (opcoes.recusaSemFormato) return responder(400, { error: 'Erro final do provedor sem response_format' })
      responder(200, { choices: [{ message: { content: '```json\n{"ok":true}\n```' } }] })
    })
  })
  await new Promise<void>(resolver => servidor.listen(0, '127.0.0.1', resolver))
  t.after(async () => {
    servidor.closeAllConnections()
    await new Promise<void>((resolver, rejeitar) => servidor.close(erro => erro ? rejeitar(erro) : resolver()))
  })
  const urlLocal = `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`
  const nomes = ['LLM_BASE_URL', 'LLM_API_KEY', 'MODELO'] as const
  const anteriores = nomes.map(nome => [nome, process.env[nome]] as const)
  t.after(() => {
    for (const [nome, valor] of anteriores) {
      if (valor === undefined) delete process.env[nome]
      else process.env[nome] = valor
    }
  })
  delete process.env.LLM_BASE_URL
  delete process.env.MODELO
  process.env.LLM_API_KEY = 'chave-de-teste'
  if (opcoes.modelo) process.env.MODELO = opcoes.modelo
  if (opcoes.baseCustomizada) process.env.LLM_BASE_URL = urlLocal
  // Intercepta todo HTTP: a configuração Gemini padrão nunca chama a rede externa
  const fetchOriginal = globalThis.fetch
  t.mock.method(globalThis, 'fetch', (url: string, init?: RequestInit) => {
    const caminho = new URL(url).pathname.replace(/^\/v1beta\/openai/, '')
    return fetchOriginal(`${urlLocal}${caminho}`, init)
  })
  const responder = criarResponder('api', '.', '.')
  const chamar = (agente: 'spec' | 'coder' | 'tester' = 'spec') =>
    responder({ agente, tentativa: 0, instrucoes: 'Responda em JSON.', entrada: { pedido: 'x' } })
  return { pedidos, chamar }
}

test('escolhe Flash-Lite Gemini estável comparando componentes da versão', () => {
  assert.equal(escolherModelo(['models/gemini-3.8-flash-lite', 'gemini-3.10-flash-lite', 'gemini-3.12-flash-lite-preview', 'gemini-4.0-flash']), 'gemini-3.10-flash-lite')
  assert.equal(escolherModelo(['gemini-3.8-flash', 'gemini-3.10-flash']), 'gemini-3.10-flash')
  assert.equal(escolherModelo(['gemini-2.0-flash-lite-001']), 'gemini-2.0-flash-lite-001')
  assert.equal(escolherModelo(['text-embedding-4', 'customflash', 'other-9.0-flash-lite', 'gemini-4.0-flash-image', 'gemini-4.0-flash-exp', 'gemini-flash-lite-latest']), undefined)
})

test('troca apenas o modelo padrão do Gemini quando inexistente', async t => {
  const p = await preparar(t, ['gemini-3.5-flash-lite'], true)
  assert.deepEqual(await p.chamar(), { ok: true })
  assert.deepEqual(p.pedidos.filter(x => x.caminho === '/chat/completions').map(x => x.corpo.model), ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite'])
})

test('aceita o alias padrão explícito usado pelo Compose para descoberta', async t => {
  const p = await preparar(t, ['gemini-3.5-flash-lite'], true, { modelo: 'gemini-flash-lite-latest' })
  assert.deepEqual(await p.chamar(), { ok: true })
  assert.equal(p.pedidos.filter(x => x.caminho === '/models').length, 1)
  assert.equal(p.pedidos.at(-1)?.corpo.model, 'gemini-3.5-flash-lite')
})

test('modelo explícito inexistente falha sem consultar catálogo nem trocar modelo', async t => {
  const p = await preparar(t, ['gemini-3.5-flash-lite'], true, { modelo: 'modelo-fixado' })
  await assert.rejects(p.chamar(), /HTTP 404.*Nenhum modelo foi substituído/)
  assert.deepEqual(p.pedidos.map(x => x.caminho), ['/chat/completions'])
})

test('base customizada falha no 404 sem escolher outro modelo', async t => {
  const p = await preparar(t, ['gemini-3.5-flash-lite'], true, { baseCustomizada: true })
  await assert.rejects(p.chamar(), /HTTP 404.*Nenhum modelo foi substituído/)
  assert.deepEqual(p.pedidos.map(x => x.caminho), ['/chat/completions'])
})

test('catálogo sem Gemini estável adequado preserva a falha', async t => {
  const p = await preparar(t, ['customflash', 'gemini-4.0-flash-preview'], true)
  await assert.rejects(p.chamar(), /HTTP 404/)
  assert.deepEqual(p.pedidos.map(x => x.caminho), ['/chat/completions', '/models'])
})

test('duas chamadas compartilham descoberta de modelo e ambas terminam', async t => {
  const p = await preparar(t, ['gemini-3.5-flash-lite'], true)
  assert.deepEqual(await Promise.all([p.chamar('coder'), p.chamar('tester')]), [{ ok: true }, { ok: true }])
  assert.equal(p.pedidos.filter(x => x.caminho === '/models').length, 1)
})

test('duas chamadas repetem sem response_format mesmo após outra desligá-lo', async t => {
  const p = await preparar(t, ['gemini-flash-lite-latest'], false)
  assert.deepEqual(await Promise.all([p.chamar('coder'), p.chamar('tester')]), [{ ok: true }, { ok: true }])
  const chamadas = p.pedidos.filter(x => x.caminho === '/chat/completions')
  assert.equal(chamadas.filter(x => x.corpo.response_format).length, 2)
  assert.equal(chamadas.filter(x => !x.corpo.response_format).length, 2)
  await p.chamar()
  assert.equal(p.pedidos.at(-1)?.corpo.response_format, undefined)
})

test('combina fallback de modelo e formato nas chamadas paralelas', async t => {
  const p = await preparar(t, ['gemini-3.5-flash-lite'], false)
  assert.deepEqual(await Promise.all([p.chamar('coder'), p.chamar('tester')]), [{ ok: true }, { ok: true }])
})

test('mantém o modelo pedido quando ele existe', async t => {
  const p = await preparar(t, ['modelo-fixado', 'gemini-3.5-flash-lite'], true, { modelo: 'modelo-fixado' })
  await p.chamar()
  assert.deepEqual(p.pedidos.map(x => x.corpo.model), ['modelo-fixado'])
})

test('preserva a mensagem do segundo 400 e limita o fallback de formato a um retry', async t => {
  const p = await preparar(t, ['gemini-flash-lite-latest'], false, { recusaSemFormato: true })
  await assert.rejects(p.chamar(), /HTTP 400: .*Erro final do provedor sem response_format/)
  assert.equal(p.pedidos.length, 2)
  assert.ok(p.pedidos[0].corpo.response_format)
  assert.equal(p.pedidos[1].corpo.response_format, undefined)
})
