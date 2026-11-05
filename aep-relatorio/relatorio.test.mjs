import assert from 'node:assert/strict'
import test from 'node:test'
import { desvioPadrao, media, mediana, metricasDoAgente } from './estatistica.mjs'
import { conferir, lerCsv } from './resultados.mjs'
import { gerarPagina, gerarTabelas } from './saidas.mjs'

const cabecalho = 'agente,caso,cenario,tipo,esperado,obtido,acertou,fp,fn,tempo_s'
const caso = (id, tipo = 'tipico', acertou = 'sim', tempo = '2') => `A,${id},cenário,${tipo},x,x,${acertou},0,0,${tempo}`

test('estatísticas conferidas com valores calculados à mão', () => {
  assert.equal(media([2, 4, 4, 4, 5, 5, 7, 9]), 5)
  assert.equal(mediana([9, 1, 5]), 5)
  assert.equal(mediana([1, 2, 3, 4]), 2.5)
  assert.ok(Math.abs(desvioPadrao([2, 4, 4, 4, 5, 5, 7, 9]) - 2.13809) < 0.0001)
  assert.equal(desvioPadrao([3]), 0)
})

test('mediana não altera a lista recebida', () => {
  const valores = [3, 1, 2]
  mediana(valores)
  assert.deepEqual(valores, [3, 1, 2])
})

test('lê CSV do Excel com ponto e vírgula, BOM e vírgula decimal', () => {
  const texto = '﻿agente;caso;cenario;tipo;esperado;obtido;acertou;fp;fn;tempo_s\r\nA;c1;a, b;borda;x;y;Não;1;0;1,5\r\n'
  const { casos, erros } = lerCsv(texto)
  assert.deepEqual(erros, [])
  assert.equal(casos[0].cenario, 'a, b')
  assert.equal(casos[0].tempo, 1.5)
  assert.equal(casos[0].acertou, false)
})

test('lê campo entre aspas com vírgula decimal', () => {
  const { casos } = lerCsv(`${cabecalho}\nA,c1,"um, dois",tipico,x,x,sim,0,0,"1,25"\n`)
  assert.equal(casos[0].cenario, 'um, dois')
  assert.equal(casos[0].tempo, 1.25)
})

test('recusa vírgula decimal sem aspas em arquivo separado por vírgula', () => {
  const { erros } = lerCsv(`${cabecalho}\nA,c1,c,tipico,x,x,sim,0,0,8,4\n`)
  assert.match(erros[0], /entre aspas/)
})

test('avisa sobre caso repetido, acerto com falso positivo e nome de agente parecido', () => {
  const linhas = ['A,c1,c,tipico,x,x,sim,1,0,1', 'A,c1,c,borda,x,x,sim,0,0,1', 'a,c9,c,tipico,x,x,sim,0,0,1']
  const { avisos } = conferir(lerCsv([cabecalho, ...linhas].join('\n')).casos)
  assert.ok(avisos.some(a => a.includes('mais de uma vez')))
  assert.ok(avisos.some(a => a.includes('acertou=sim')))
  assert.ok(avisos.some(a => a.includes('maiúsculas')))
})

test('recusa CSV sem coluna', () => {
  assert.match(lerCsv('agente,caso\nA,c1\n').erros[0], /Faltam as colunas/)
})

test('recusa caso sem saída real, sem tempo ou com acertou inválido', () => {
  const { casos } = lerCsv(`${cabecalho}\nA,c1,c,tipico,x,,talvez,0,0,\n`)
  const { erros } = conferir(casos)
  assert.equal(erros.length, 3)
})

test('avisa sobre menos de cinco casos e falta de borda', () => {
  const { casos } = lerCsv([cabecalho, caso('c1'), caso('c2')].join('\n'))
  const { avisos } = conferir(casos)
  assert.equal(avisos.length, 2)
})

test('cinco casos com borda não geram aviso', () => {
  const linhas = [caso('1'), caso('2'), caso('3'), caso('4', 'borda'), caso('5', 'borda')]
  const { casos } = lerCsv([cabecalho, ...linhas].join('\n'))
  assert.deepEqual(conferir(casos), { erros: [], avisos: [] })
})

test('calcula as métricas do agente', () => {
  const { casos } = lerCsv([cabecalho, caso('1', 'tipico', 'sim', '1'), caso('2', 'borda', 'nao', '3')].join('\n'))
  const m = metricasDoAgente(casos)
  assert.equal(m.taxa, 0.5)
  assert.equal(m.taxaBorda, 0)
  assert.equal(m.tempoMedia, 2)
})

test('agente sem borda mostra n/d e as tabelas seguem o modelo', () => {
  const { casos } = lerCsv([cabecalho, caso('1')].join('\n'))
  const md = gerarTabelas([{ nome: 'A', casos }])
  assert.match(md, /Casos de teste executados/)
  assert.match(md, /\| Nº \| Cenário testado \| Resultado esperado \| Resultado obtido \|/)
  assert.match(md, /Meta\/critério de aceitação \(Entrega 1\)/)
  assert.match(md, /Consolidação estatística geral do ecossistema/)
  assert.match(md, /n\/d/)
})

test('escapa texto do usuário nos gráficos', () => {
  const { casos } = lerCsv([cabecalho, 'A<b>,c1,c,tipico,x,x,sim,0,0,1'].join('\n'))
  const html = gerarPagina([{ nome: 'A<b>', casos }])
  assert.ok(!html.includes('A<b>'))
  assert.ok(html.includes('A&lt;b&gt;'))
})
