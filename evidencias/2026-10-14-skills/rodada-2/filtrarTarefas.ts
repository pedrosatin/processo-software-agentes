export type Tarefa = { id: number, titulo: string, concluida: boolean }

export function filtrarTarefas(tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[] {
  const estado = filtro.estado

  if (estado !== 'todas' && estado !== 'abertas' && estado !== 'concluidas') {
    throw new Error('Estado inválido')
  }

  const termo = (filtro.termo ?? '').trim().toLowerCase()

  return tarefas.filter((tarefa) => {
    if (estado === 'abertas' && tarefa.concluida) return false
    if (estado === 'concluidas' && !tarefa.concluida) return false
    if (termo === '') return true
    return tarefa.titulo.toLowerCase().includes(termo)
  })
}
