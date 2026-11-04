// Avalia o agente validador: compara os achados de saida/<caso>.json com os esperados em casos.json.
import { avaliar } from '../metricas.mjs'

process.exitCode = await avaliar({
  nome: 'validador',
  arquivoSaida: caso => `saida/${caso.id}.json`,
  extrair: texto => {
    try {
      const dados = JSON.parse(texto.replace(/^```(?:json)?\s*|\s*```$/g, ''))
      return { itens: Array.isArray(dados.achados) ? dados.achados : [], marca: dados.agente === 'validador' }
    } catch {
      return { itens: ['saída não é JSON válido'], marca: false }
    }
  },
})
