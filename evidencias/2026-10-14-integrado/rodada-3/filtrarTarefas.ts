export type Tarefa = {
  id: number
  titulo: string
  concluida: boolean
}

export function filtrarTarefas(tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[] {
  const estado = filtro.estado
  if (estado !== 'todas' && estado !== 'abertas' && estado !== 'concluidas') {
    throw new Error('Estado inválido')
  }
  const termo = (filtro.termo === undefined ? '' : filtro.termo).trim().toLowerCase()
  return tarefas.filter((t) => {
    if (estado === 'abertas' && t.concluida) return false
    if (estado === 'concluidas' && !t.concluida) return false
    if (termo === '') return true
    return t.titulo.toLowerCase().includes(termo)
  })
}
