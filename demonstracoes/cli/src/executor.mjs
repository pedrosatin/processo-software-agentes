// Roda em processo filho com --permission. Lê os casos pela entrada padrão,
// importa o módulo transpilado e devolve um resultado por caso na saída padrão
import { pathToFileURL } from 'node:url'
import { isDeepStrictEqual } from 'node:util'

const lerEntrada = async () => {
  const partes = []
  for await (const parte of process.stdin) partes.push(parte)
  return JSON.parse(Buffer.concat(partes).toString('utf8'))
}

const avaliar = (filtrar, caso) => {
  const base = { nome: caso.nome, criterio: caso.criterio }
  const entrada = structuredClone(caso.tarefas)
  try {
    const saida = filtrar(entrada, structuredClone(caso.filtro))
    if (!isDeepStrictEqual(entrada, caso.tarefas)) return { ...base, aprovado: false, detalhe: 'A lista de entrada foi alterada' }
    if (caso.esperadoErro !== undefined) return { ...base, aprovado: false, detalhe: `Esperava erro "${caso.esperadoErro}" e recebeu uma lista` }
    if (!Array.isArray(saida)) return { ...base, aprovado: false, detalhe: 'O retorno não é uma lista' }
    const ids = saida.map(tarefa => tarefa?.id)
    if (!isDeepStrictEqual(ids, caso.esperadoIds)) return { ...base, aprovado: false, detalhe: `Esperava ids ${JSON.stringify(caso.esperadoIds)} e recebeu ${JSON.stringify(ids)}` }
    const preservados = saida.every(tarefa => caso.tarefas.some(original => isDeepStrictEqual(tarefa, original)))
    return preservados ? { ...base, aprovado: true, detalhe: 'ok' } : { ...base, aprovado: false, detalhe: 'Objetos retornados diferem dos originais' }
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro)
    if (caso.esperadoErro === undefined) return { ...base, aprovado: false, detalhe: `Erro inesperado: ${mensagem}` }
    return mensagem === caso.esperadoErro
      ? { ...base, aprovado: true, detalhe: 'ok' }
      : { ...base, aprovado: false, detalhe: `Esperava erro "${caso.esperadoErro}" e recebeu "${mensagem}"` }
  }
}

try {
  const { casos } = await lerEntrada()
  const modulo = await import(pathToFileURL(process.argv[2]).href)
  if (typeof modulo.filtrarTarefas !== 'function') throw new Error('O módulo não exporta filtrarTarefas')
  console.log(JSON.stringify(casos.map(caso => avaliar(modulo.filtrarTarefas, caso))))
} catch (erro) {
  console.error(erro instanceof Error ? erro.message : String(erro))
  process.exitCode = 1
}
