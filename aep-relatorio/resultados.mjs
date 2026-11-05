// Lê o CSV de resultados e aponta o que impede o relatório. Aceita vírgula ou ponto e vírgula como separador.

const COLUNAS = ['agente', 'caso', 'cenario', 'tipo', 'esperado', 'obtido', 'acertou', 'fp', 'fn', 'tempo_s']
export const MINIMO_DE_CASOS = 5

const separarLinha = (linha, separador) => {
  const campos = []
  let atual = ''
  let entreAspas = false
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i]
    if (c === '"' && entreAspas && linha[i + 1] === '"') {
      atual += '"'
      i++
    } else if (c === '"') {
      entreAspas = !entreAspas
    } else if (c === separador && !entreAspas) {
      campos.push(atual)
      atual = ''
    } else {
      atual += c
    }
  }
  return [...campos, atual].map(campo => campo.trim())
}

const numero = texto => Number(String(texto).replace(',', '.'))

const paraCaso = (valores, linha) => ({
  linha,
  agente: valores.agente,
  caso: valores.caso,
  cenario: valores.cenario,
  tipo: valores.tipo.toLowerCase(),
  esperado: valores.esperado,
  obtido: valores.obtido,
  acertou: ['sim', 's', '1', 'true'].includes(valores.acertou.toLowerCase()),
  acertouTexto: valores.acertou.toLowerCase(),
  fp: valores.fp === '' ? 0 : numero(valores.fp),
  fn: valores.fn === '' ? 0 : numero(valores.fn),
  tempo: numero(valores.tempo_s),
})

export const lerCsv = texto => {
  const linhas = texto.replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim() !== '')
  if (linhas.length === 0) return { casos: [], erros: ['O arquivo está vazio.'] }
  const separador = linhas[0].includes(';') ? ';' : ','
  const cabecalho = separarLinha(linhas[0], separador).map(c => c.toLowerCase())
  const faltando = COLUNAS.filter(c => !cabecalho.includes(c))
  if (faltando.length > 0) return { casos: [], erros: [`Faltam as colunas: ${faltando.join(', ')}.`] }
  const separadas = linhas.slice(1).map(texto => separarLinha(texto, separador))
  const erros = separadas.flatMap((campos, i) => (campos.length === cabecalho.length
    ? []
    : [`Linha ${i + 2}: ${campos.length} campos, o cabeçalho tem ${cabecalho.length}. Número com vírgula decimal em arquivo separado por vírgula vai entre aspas.`]))
  const casos = separadas.map((campos, i) => paraCaso(Object.fromEntries(cabecalho.map((nome, j) => [nome, campos[j] ?? ''])), i + 2))
  return { casos, erros }
}

const errosDoCaso = c => [
  c.agente === '' ? `Linha ${c.linha}: agente vazio.` : '',
  c.caso === '' ? `Linha ${c.linha}: caso vazio.` : '',
  !['tipico', 'típico', 'borda'].includes(c.tipo) ? `Linha ${c.linha}: tipo precisa ser tipico ou borda.` : '',
  !['sim', 's', '1', 'true', 'nao', 'não', 'n', '0', 'false'].includes(c.acertouTexto) ? `Linha ${c.linha}: acertou precisa ser sim ou nao.` : '',
  c.obtido === '' ? `Linha ${c.linha}: registre a saída real do agente em obtido.` : '',
  !Number.isFinite(c.tempo) || c.tempo <= 0 ? `Linha ${c.linha}: tempo_s precisa ser um número maior que zero.` : '',
  !Number.isInteger(c.fp) || c.fp < 0 ? `Linha ${c.linha}: fp precisa ser inteiro, zero ou maior.` : '',
  !Number.isInteger(c.fn) || c.fn < 0 ? `Linha ${c.linha}: fn precisa ser inteiro, zero ou maior.` : '',
].filter(Boolean)

const repetidos = lista => [...new Set(lista.filter((item, i) => lista.indexOf(item) !== i))]

export const agruparPorAgente = casos =>
  [...new Set(casos.map(c => c.agente))].map(nome => ({ nome, casos: casos.filter(c => c.agente === nome) }))

export const conferir = casos => {
  const agentes = agruparPorAgente(casos)
  const erros = casos.flatMap(errosDoCaso)
  const avisos = agentes.flatMap(({ nome, casos: doAgente }) => [
    doAgente.length < MINIMO_DE_CASOS ? `${nome}: ${doAgente.length} casos. A rubrica pede no mínimo ${MINIMO_DE_CASOS}.` : '',
    !doAgente.some(c => c.tipo === 'borda') ? `${nome}: nenhum cenário de borda. A rubrica pede cenários típicos e de borda.` : '',
    !doAgente.some(c => ['tipico', 'típico'].includes(c.tipo)) ? `${nome}: nenhum cenário típico.` : '',
    ...repetidos(doAgente.map(c => c.caso)).map(caso => `${nome}: o caso ${caso} aparece mais de uma vez e conta como casos separados.`),
    ...doAgente.filter(c => c.acertou && c.fp + c.fn > 0).map(c => `${nome}: o caso ${c.caso} tem acertou=sim com falso positivo ou negativo.`),
  ].filter(Boolean))
  const nomesParecidos = repetidos(agentes.map(a => a.nome.toLowerCase()))
    .map(nome => `Há nomes de agente que diferem só em maiúsculas: ${nome}.`)
  return { erros, avisos: [...avisos, ...nomesParecidos] }
}
