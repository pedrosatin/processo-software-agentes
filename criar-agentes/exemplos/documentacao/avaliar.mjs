// Avalia o agente documentador: compara parâmetros e erros listados em saida/<caso>.md com os esperados em casos.json.
import { avaliar } from '../metricas.mjs'

const secao = (texto, titulo) => texto.split(/^## /m).find(s => s.startsWith(titulo))?.split('\n').slice(1) ?? []

process.exitCode = await avaliar({
  nome: 'documentador',
  arquivoSaida: caso => `saida/${caso.id}.md`,
  extrair: texto => ({
    marca: texto.includes('<!-- agente: documentador -->'),
    itens: [
      ...secao(texto, 'Parâmetros').map(l => l.match(/^- `([^`]+)`/)?.[1]).filter(Boolean).map(x => `param:${x}`),
      ...secao(texto, 'Erros').map(l => l.match(/^- "([^"]+)"/)?.[1]).filter(Boolean).map(x => `erro:${x}`),
    ],
  }),
})
