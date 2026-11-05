// Cálculos usados nas tabelas do relatório. Funções puras, sem leitura de arquivo.

export const media = valores => valores.reduce((soma, v) => soma + v, 0) / valores.length

export const mediana = valores => {
  const ordenados = [...valores].sort((a, b) => a - b)
  const meio = Math.floor(ordenados.length / 2)
  return ordenados.length % 2 === 0 ? (ordenados[meio - 1] + ordenados[meio]) / 2 : ordenados[meio]
}

// Desvio padrão amostral, com divisão por n - 1. Equivale a DESVPAD.A no Excel e a STDEV no Google Sheets.
export const desvioPadrao = valores => {
  if (valores.length < 2) return 0
  const m = media(valores)
  return Math.sqrt(valores.reduce((soma, v) => soma + (v - m) ** 2, 0) / (valores.length - 1))
}

const proporcao = (parte, todo) => (todo === 0 ? null : parte / todo)

export const metricasDoAgente = casos => {
  const tempos = casos.map(c => c.tempo)
  const acertos = casos.filter(c => c.acertou).length
  const fp = casos.reduce((soma, c) => soma + c.fp, 0)
  const fn = casos.reduce((soma, c) => soma + c.fn, 0)
  const bordas = casos.filter(c => c.tipo === 'borda')
  return {
    casos: casos.length,
    acertos,
    taxa: proporcao(acertos, casos.length),
    bordas: bordas.length,
    taxaBorda: proporcao(bordas.filter(c => c.acertou).length, bordas.length),
    fp,
    fn,
    tempoMedia: media(tempos),
    tempoMediana: mediana(tempos),
    tempoDesvio: desvioPadrao(tempos),
    tempoMin: Math.min(...tempos),
    tempoMax: Math.max(...tempos),
  }
}
