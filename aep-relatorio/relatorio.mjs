// Uso: node relatorio.mjs [resultados.csv]. Grava saida/tabelas.md e saida/graficos.html.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { agruparPorAgente, conferir, lerCsv } from './resultados.mjs'
import { gerarPagina, gerarTabelas } from './saidas.mjs'

// O Excel pode gravar CSV em Windows-1252. UTF-8 inválido cai nessa codificação.
const decodificar = bytes => {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('windows-1252').decode(bytes)
  }
}

const executar = async arquivo => {
  const { casos, erros: errosDoArquivo } = lerCsv(decodificar(await readFile(arquivo)))
  const { erros, avisos } = conferir(casos)
  const todosOsErros = [...errosDoArquivo, ...erros]
  if (todosOsErros.length > 0 || casos.length === 0) {
    console.error(['Corrija o CSV antes de gerar o relatório:', ...todosOsErros].join('\n'))
    return 1
  }
  const agentes = agruparPorAgente(casos)
  await mkdir('saida', { recursive: true })
  await writeFile('saida/tabelas.md', gerarTabelas(agentes))
  await writeFile('saida/graficos.html', gerarPagina(agentes))
  console.log(`${agentes.length} agentes e ${casos.length} casos. Gravados saida/tabelas.md e saida/graficos.html.`)
  avisos.forEach(aviso => console.log(`Aviso: ${aviso}`))
  return 0
}

try {
  process.exitCode = await executar(process.argv[2] ?? 'resultados.csv')
} catch (erro) {
  console.error(`Não foi possível gerar o relatório: ${erro.message}`)
  process.exitCode = 1
}
