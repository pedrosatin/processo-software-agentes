export type Tarefa = { id: number, titulo: string, concluida: boolean }

export function filtrarTarefas(tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[] {
  const { estado } = filtro
  if (estado !== 'todas' && estado !== 'abertas' && estado !== 'concluidas') {
    throw new Error('Estado inválido')
  }
  const termo = (filtro.termo ?? '').trim().toLowerCase()
  return tarefas.filter(tarefa =>
    (estado === 'todas' || tarefa.concluida === (estado === 'concluidas')) &&
    (termo === '' || tarefa.titulo.toLowerCase().includes(termo))
  )
}
