export type Tarefa = { id: number, titulo: string, concluida: boolean }

const ESTADOS_VALIDOS = ['todas', 'abertas', 'concluidas']

export function filtrarTarefas(tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[] {
  if (!ESTADOS_VALIDOS.includes(filtro.estado)) {
    throw new Error('Estado inválido')
  }

  const termo = (filtro.termo ?? '').trim().toLowerCase()

  return tarefas.filter((tarefa) => {
    if (filtro.estado === 'abertas' && tarefa.concluida) return false
    if (filtro.estado === 'concluidas' && !tarefa.concluida) return false
    if (termo === '') return true
    return tarefa.titulo.toLowerCase().includes(termo)
  })
}
