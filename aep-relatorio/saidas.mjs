// Monta as tabelas em Markdown, na ordem do modelo da Entrega 2, e a página com os gráficos em SVG.
import { metricasDoAgente } from './estatistica.mjs'

const decimal = (valor, casas = 2) => valor.toFixed(casas).replace('.', ',')
const porcento = valor => (valor === null ? 'n/d' : `${decimal(valor * 100, 1)}%`)
const celula = texto => String(texto).replaceAll('|', '\\|')
const tabela = (cabecalho, linhas) => [
  `| ${cabecalho.join(' | ')} |`,
  `|${cabecalho.map(() => '---').join('|')}|`,
  ...linhas.map(l => `| ${l.map(celula).join(' | ')} |`),
].join('\n')

const linhasDeMetricas = m => [
  ['Taxa de acerto/precisão', `${porcento(m.taxa)} (${m.acertos} de ${m.casos})`, ''],
  ['Tempo médio de resposta', `${decimal(m.tempoMedia)} s`, ''],
  ['Taxa de acerto nos casos de borda', `${porcento(m.taxaBorda)} (${m.bordas} casos)`, ''],
  ['Falsos positivos', m.fp, ''],
  ['Falsos negativos', m.fn, ''],
  ['Mediana do tempo', `${decimal(m.tempoMediana)} s`, ''],
  ['Desvio padrão do tempo', `${decimal(m.tempoDesvio)} s`, ''],
]

const CABECALHO_CASOS = ['Nº', 'Cenário testado', 'Resultado esperado', 'Resultado obtido']
const CABECALHO_METRICAS = ['Métrica', 'Valor obtido', 'Meta/critério de aceitação (Entrega 1)']
const CABECALHO_GERAL = ['Agente', 'Nº de testes', 'Taxa de sucesso', 'Tempo médio (s)']

const linhasDeCasos = casos => casos.map((c, i) => [i + 1, c.cenario, c.esperado, c.obtido])
const linhasGerais = agentes => agentes.map(({ nome, casos }) => {
  const m = metricasDoAgente(casos)
  return [nome, m.casos, porcento(m.taxa), decimal(m.tempoMedia)]
})

const secaoDoAgente = ({ nome, casos }) => [
  `## ${nome}`,
  '',
  '### Casos de teste executados',
  '',
  tabela(CABECALHO_CASOS, linhasDeCasos(casos)),
  '',
  '### Métricas e estatísticas coletadas',
  '',
  tabela(CABECALHO_METRICAS, linhasDeMetricas(metricasDoAgente(casos))),
].join('\n')

export const gerarTabelas = agentes => [
  '# Tabelas para o relatório da Entrega 2',
  '',
  'Para colar no Word ou no Google Docs, copie as tabelas de saida/graficos.html. A coluna de meta vem da Entrega 1 e é preenchida pela equipe. A linha da métrica própria do agente também é da equipe.',
  '',
  ...agentes.flatMap(a => [secaoDoAgente(a), '']),
  '## Consolidação estatística geral do ecossistema',
  '',
  tabela(CABECALHO_GERAL, linhasGerais(agentes)),
  '',
].join('\n')

const escapar = texto => String(texto).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

// Barras horizontais com o valor escrito ao lado. O teto define a escala do eixo.
const barras = (titulo, itens, teto, formatar) => {
  const altura = 34
  const largura = 460
  const rotulo = 240
  const linhas = itens.map(({ nome, valor }, i) => {
    const y = 40 + i * altura
    const tamanho = teto === 0 ? 0 : (valor / teto) * largura
    return `<text x="${rotulo - 10}" y="${y + 17}" text-anchor="end">${escapar(nome)}</text>`
      + `<rect x="${rotulo}" y="${y}" width="${tamanho.toFixed(1)}" height="24" fill="#2f6f4f"/>`
      + `<text x="${(rotulo + tamanho + 8).toFixed(1)}" y="${y + 17}">${escapar(formatar(valor))}</text>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="${50 + itens.length * altura}" font-family="Arial, sans-serif" font-size="14">`
    + `<text x="0" y="20" font-size="16" font-weight="bold">${escapar(titulo)}</text>${linhas}</svg>`
}

const tabelaHtml = (cabecalho, linhas) => `<table><tr>${cabecalho.map(c => `<th>${escapar(c)}</th>`).join('')}</tr>`
  + linhas.map(l => `<tr>${l.map(c => `<td>${escapar(c)}</td>`).join('')}</tr>`).join('')
  + '</table>'

const figura = conteudo => `<figure>${conteudo}</figure>`

const blocoDoAgente = ({ nome, casos }) => {
  const m = metricasDoAgente(casos)
  return `<h2>${escapar(nome)}</h2>`
    + tabelaHtml(CABECALHO_CASOS, linhasDeCasos(casos))
    + tabelaHtml(CABECALHO_METRICAS, linhasDeMetricas(m))
    + figura(barras(`Resultado dos casos, ${nome}`, [
      { nome: 'Aprovados', valor: m.acertos },
      { nome: 'Reprovados', valor: m.casos - m.acertos },
    ], m.casos, v => String(v)))
    + figura(barras(`Tempo por caso, ${nome} (s)`, casos.map(c => ({ nome: c.caso, valor: c.tempo })),
      Math.max(...casos.map(c => c.tempo)), v => `${decimal(v)} s`))
}

export const gerarPagina = agentes => {
  const metricas = agentes.map(a => ({ nome: a.nome, m: metricasDoAgente(a.casos) }))
  const tempoMaximo = Math.max(...metricas.map(({ m }) => m.tempoMedia))
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Tabelas e gráficos da Entrega 2</title>`
    + `<style>body{background:#fff;color:#111;margin:24px;font-family:Arial,sans-serif}figure{margin:0 0 28px}svg{max-width:100%;height:auto}`
    + `table{border-collapse:collapse;margin:0 0 20px}th,td{border:1px solid #999;padding:6px 10px;text-align:left}</style></head><body>`
    + agentes.map(blocoDoAgente).join('')
    + '<h2>Consolidação geral do ecossistema</h2>'
    + tabelaHtml(CABECALHO_GERAL, linhasGerais(agentes))
    + figura(barras('Taxa de sucesso por agente', metricas.map(({ nome, m }) => ({ nome, valor: m.taxa })), 1, porcento))
    + figura(barras('Tempo médio de resposta por agente (s)', metricas.map(({ nome, m }) => ({ nome, valor: m.tempoMedia })), tempoMaximo, v => `${decimal(v)} s`))
    + '</body></html>\n'
}
