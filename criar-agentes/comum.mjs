// Funções usadas por pedido.mjs, testar.mjs e evidencia.mjs.
import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { isDeepStrictEqual } from 'node:util'

export const raValido = ra => /^\d{6,10}-\d$/.test(ra)

export const pedidoDoRa = ra => `P${(Number(ra.split('-')[0]) % 8) + 1}`

export const lerPedidoAtual = async () => {
  if (!existsSync('.pedido')) throw new Error('Nenhum pedido escolhido. Execute node pedido.mjs <RA> ou node pedido.mjs exemplo.')
  const id = (await readFile('.pedido', 'utf8')).trim()
  const casos = JSON.parse(await readFile(join('pedidos', id, 'casos.json'), 'utf8'))
  return { id, ...casos }
}

const executarCaso = (fn, caso, comparar) => {
  const entrada = structuredClone(caso.entrada)
  try {
    const recebido = fn(...entrada)
    if (!isDeepStrictEqual(entrada, caso.entrada)) return { nome: caso.nome, passou: false, detalhe: 'a entrada recebida foi alterada' }
    if (caso.esperadoErro !== undefined) return { nome: caso.nome, passou: false, detalhe: `esperava erro "${caso.esperadoErro}"` }
    const valor = comparar === 'ids' && Array.isArray(recebido) ? recebido.map(x => x?.id) : recebido
    return isDeepStrictEqual(valor, caso.esperado)
      ? { nome: caso.nome, passou: true }
      : { nome: caso.nome, passou: false, detalhe: `esperava ${JSON.stringify(caso.esperado)} e recebeu ${JSON.stringify(valor)}` }
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro)
    return mensagem === caso.esperadoErro
      ? { nome: caso.nome, passou: true }
      : { nome: caso.nome, passou: false, detalhe: `erro inesperado "${mensagem}"` }
  }
}

export const testar = async pedido => {
  const arquivo = join('saida', `${pedido.funcao}.ts`)
  if (!existsSync(arquivo)) return { arquivo, erro: `${arquivo} não existe`, resultados: [] }
  let modulo
  try {
    modulo = await import(pathToFileURL(arquivo).href + `?v=${Date.now()}`)
  } catch (erro) {
    return { arquivo, erro: `não foi possível carregar ${arquivo}: ${erro.message}`, resultados: [] }
  }
  if (typeof modulo[pedido.funcao] !== 'function') return { arquivo, erro: `${arquivo} não exporta ${pedido.funcao}`, resultados: [] }
  const inicio = performance.now()
  const resultados = pedido.casos.map(caso => executarCaso(modulo[pedido.funcao], caso, pedido.comparar))
  return { arquivo, resultados, ms: Math.round(performance.now() - inicio) }
}

const semAspas = valor => (/^(["']).*\1$/.test(valor) ? valor.slice(1, -1) : valor)

const frontmatter = texto => {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { campos: {}, corpo: texto }
  const campos = {}
  let lista = null
  let ultimo = null
  for (const linha of m[1].split(/\r?\n/)) {
    const item = linha.match(/^\s+-\s+(.*)$/)
    if (item && lista) { campos[lista].push(item[1].trim()); continue }
    const continuacao = linha.match(/^\s+(\S.*)$/)
    if (continuacao && ultimo && typeof campos[ultimo] === 'string') { campos[ultimo] += ' ' + continuacao[1].trim(); continue }
    const par = linha.match(/^([A-Za-z_]+):\s*(.*)$/)
    if (!par) continue
    lista = par[2] === '' ? par[1] : null
    ultimo = par[1]
    campos[par[1]] = par[2] === '' ? [] : semAspas(par[2].trim())
  }
  return { campos, corpo: m[2] }
}

const toml = texto => {
  const desescapar = valor => valor?.replace(/\\(["\\])/g, '$1')
  const campo = nome => desescapar(texto.match(new RegExp(`^${nome}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'm'))?.[1])
  const instrucoes = texto.match(/developer_instructions\s*=\s*"""([\s\S]*?)"""/)?.[1] ?? desescapar(texto.match(/developer_instructions\s*=\s*"((?:[^"\\]|\\.)*)"/)?.[1])
  return { campos: { name: campo('name'), description: campo('description') }, corpo: instrucoes ?? '' }
}

export const PASTAS_AGENTES = ['.agents/agents/', '.claude/agents/', '.codex/agents/']

const LOCAIS = [
  { harness: 'Antigravity', pasta: join('.agents', 'agents'), ext: '.md', ler: frontmatter },
  { harness: 'Claude Code', pasta: join('.claude', 'agents'), ext: '.md', ler: frontmatter },
  { harness: 'Codex', pasta: join('.codex', 'agents'), ext: '.toml', ler: toml },
]

export const lerAgentes = async () => {
  const agentes = []
  for (const local of LOCAIS) {
    if (!existsSync(local.pasta)) continue
    for (const nome of await readdir(local.pasta)) {
      if (!nome.endsWith(local.ext)) continue
      const arquivo = join(local.pasta, nome)
      const conteudo = await readFile(arquivo, 'utf8')
      const { campos, corpo } = local.ler(conteudo)
      agentes.push({ harness: local.harness, arquivo, nome: campos.name ?? '', descricao: campos.description ?? '', ferramentas: campos.tools ?? null, instrucoes: corpo.trim(), conteudo })
    }
  }
  return agentes
}
