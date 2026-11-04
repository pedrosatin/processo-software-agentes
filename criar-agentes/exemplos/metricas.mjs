// Compara o que o agente produziu com o esperado e calcula acerto, falsos positivos e falsos negativos.
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const lerJson = async arquivo => JSON.parse(await readFile(arquivo, 'utf8'))

const comparar = (esperado, obtido) => {
  const e = new Set(esperado)
  const o = new Set(obtido)
  const verdadeiros = [...o].filter(x => e.has(x))
  const falsosPositivos = [...o].filter(x => !e.has(x))
  const falsosNegativos = [...e].filter(x => !o.has(x))
  return { verdadeiros, falsosPositivos, falsosNegativos, exato: falsosPositivos.length === 0 && falsosNegativos.length === 0 }
}

// extrair(texto, caso) devolve { itens: string[], marca: boolean }. Quem chama define o formato da saída do agente.
export const avaliar = async ({ nome, extrair, arquivoSaida }) => {
  const casos = await lerJson('casos.json')
  const linhas = []
  for (const caso of casos) {
    const arquivo = arquivoSaida(caso)
    if (!existsSync(arquivo)) {
      linhas.push({ caso, semSaida: true, ...comparar(caso.esperado, []) })
      continue
    }
    const { itens, marca } = extrair(await readFile(arquivo, 'utf8'), caso)
    linhas.push({ caso, marca, obtido: itens, ...comparar(caso.esperado, itens) })
  }
  const com = linhas.filter(l => !l.semSaida)
  const exatos = linhas.filter(l => l.exato).length
  const fp = linhas.reduce((n, l) => n + l.falsosPositivos.length, 0)
  const fn = linhas.reduce((n, l) => n + l.falsosNegativos.length, 0)
  const vp = linhas.reduce((n, l) => n + l.verdadeiros.length, 0)

  console.log(`Avaliação do agente ${nome}\n`)
  for (const l of linhas) {
    const estado = l.semSaida ? 'sem saída' : l.exato ? 'ok' : 'erro'
    const detalhes = [
      l.falsosPositivos.length ? `falso positivo: ${l.falsosPositivos.join(', ')}` : '',
      l.falsosNegativos.length ? `falso negativo: ${l.falsosNegativos.join(', ')}` : '',
      !l.semSaida && !l.marca ? 'sem a marca do agente na saída' : '',
    ].filter(Boolean).join('; ')
    console.log(`${estado.padEnd(10)} ${l.caso.id.padEnd(22)} esperado [${l.caso.esperado.join(', ')}] ${detalhes}`)
  }
  const precisao = vp + fp === 0 ? null : Math.round(vp * 100 / (vp + fp))
  const cobertura = vp + fn === 0 ? null : Math.round(vp * 100 / (vp + fn))
  console.log(`\nCasos exatos: ${exatos} de ${linhas.length} (${Math.round(exatos * 100 / linhas.length)}%)`)
  console.log(`Itens corretos: ${vp}. Falsos positivos: ${fp}. Falsos negativos: ${fn}.`)
  console.log(`Precisão: ${precisao ?? 'n/d'}%. Cobertura: ${cobertura ?? 'n/d'}%.`)
  const semMarca = com.filter(l => !l.marca).length
  if (linhas.length !== com.length) console.log(`\n${linhas.length - com.length} casos sem saída. O agente não rodou para eles.`)
  if (semMarca) console.log(`\n${semMarca} saídas sem a marca do agente. Confira se o harness chamou o agente ou se a conversa principal escreveu o arquivo.`)
  console.log('\nTempo médio por caso não é medido por este script. Meça com o relógio do harness ou com time em modo não interativo.')
  return linhas.length === com.length ? 0 : 1
}
