export type Tarefa = {
  id: number
  titulo: string
  concluida: boolean
}

export type FiltroTarefas = {
  estado: string
  termo?: string
}

type PredicadoEstado = (tarefa: Tarefa) => boolean

const predicadosPorEstado = new Map<string, PredicadoEstado>([
  ['todas', () => true],
  ['abertas', (tarefa) => !tarefa.concluida],
  ['concluidas', (tarefa) => tarefa.concluida]
])

const obterPredicadoEstado = (estado: string): PredicadoEstado => {
  const predicado = predicadosPorEstado.get(estado)
  if (predicado === undefined) {
    throw new Error('Estado inválido')
  }
  return predicado
}

const normalizarTermo = (termo: string | undefined): string | undefined => {
  if (termo === undefined) {
    return undefined
  }
  const limpo = termo.trim().toLowerCase()
  return limpo === '' ? undefined : limpo
}

export const filtrarTarefas = (tarefas: Tarefa[], filtro: FiltroTarefas): Tarefa[] => {
  const predicadoEstado = obterPredicadoEstado(filtro.estado)
  const termo = normalizarTermo(filtro.termo)

  return tarefas.filter((tarefa) => {
    if (!predicadoEstado(tarefa)) {
      return false
    }
    if (termo === undefined) {
      return true
    }
    return tarefa.titulo.toLowerCase().includes(termo)
  })
}
