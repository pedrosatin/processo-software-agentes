import { appendFileSync } from 'node:fs'

let arquivoDeEventos: string | undefined

export const gravarEventosEm = (caminho: string): void => {
  arquivoDeEventos = caminho
}

// Uma linha JSON por evento, no terminal e em eventos.jsonl da execução
export const registrar = (evento: Record<string, unknown>): void => {
  const linha = JSON.stringify({ horario: new Date().toISOString(), ...evento })
  console.log(linha)
  if (arquivoDeEventos) appendFileSync(arquivoDeEventos, linha + '\n', 'utf8')
}
