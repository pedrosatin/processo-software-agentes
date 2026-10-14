// Executa saida/casos.json contra saida/filtrarTarefas.ts e confere se cada
// critério de saida/spec.md tem pelo menos um caso. Requer Node 23.6 ou posterior.
// Uso: node ../comum/testar.mjs [pasta] [--json]
import { readFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { isDeepStrictEqual } from 'node:util'

const args = process.argv.slice(2)
const pasta = resolve(args.find(arg => !arg.startsWith('--')) ?? 'saida')
const comoJson = args.includes('--json')

const lerCriterios = async () => {
  const spec = await readFile(join(pasta, 'spec.md'), 'utf8')
  const secao = spec.split(/^## Dúvidas/m)[0]
  return [...new Set(secao.match(/\bC\d{2}\b/g) ?? [])]
}

const executarCaso = (filtrar, caso) => {
  const tarefas = structuredClone(caso.tarefas)
  const base = { nome: caso.nome, criterio: caso.criterio }
  try {
    const ids = filtrar(tarefas, caso.filtro).map(tarefa => tarefa.id)
    if (!isDeepStrictEqual(tarefas, caso.tarefas)) return { ...base, passou: false, detalhe: 'a lista recebida foi alterada' }
    if (caso.esperadoErro !== undefined) return { ...base, passou: false, detalhe: `esperava erro "${caso.esperadoErro}"` }
    return isDeepStrictEqual(ids, caso.esperadoIds)
      ? { ...base, passou: true }
      : { ...base, passou: false, detalhe: `esperava ${JSON.stringify(caso.esperadoIds)} e recebeu ${JSON.stringify(ids)}` }
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro)
    return mensagem === caso.esperadoErro
      ? { ...base, passou: true }
      : { ...base, passou: false, detalhe: `erro inesperado "${mensagem}"` }
  }
}

const principal = async () => {
  const criterios = await lerCriterios()
  const casos = JSON.parse(await readFile(join(pasta, 'casos.json'), 'utf8'))
  const { filtrarTarefas } = await import(pathToFileURL(join(pasta, 'filtrarTarefas.ts')).href)
  const resultados = casos.map(caso => executarCaso(filtrarTarefas, caso))
  const cobertos = new Set(casos.map(caso => caso.criterio))
  const semCaso = criterios.filter(id => !cobertos.has(id))
  const aprovado = resultados.every(r => r.passou) && semCaso.length === 0
  if (comoJson) {
    console.log(JSON.stringify({ aprovado, resultados, semCaso }))
  } else {
    resultados.forEach(r => console.log(`${r.passou ? 'ok   ' : 'falha'} ${r.criterio} ${r.nome}${r.detalhe ? `: ${r.detalhe}` : ''}`))
    console.log(`\n${resultados.filter(r => r.passou).length} de ${resultados.length} casos aprovados`)
    console.log('Cada caso também confere que a lista recebida não foi alterada.')
    if (semCaso.length > 0) console.log(`Critérios sem caso: ${semCaso.join(', ')}`)
  }
  return aprovado ? 0 : 1
}

try {
  process.exitCode = await principal()
} catch (erro) {
  console.error(erro instanceof Error ? erro.message : String(erro))
  process.exitCode = 2
}
