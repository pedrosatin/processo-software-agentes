export type Tarefa = {
  id: number
  titulo: string
  concluida: boolean
}

export function filtrarTarefas(
  tarefas: Tarefa[],
  filtro: { estado: string, termo?: string }
): Tarefa[] {
  if (filtro.estado !== 'todas' && filtro.estado !== 'abertas' && filtro.estado !== 'concluidas') {
    throw new Error('Estado inválido')
  }

  const termo = filtro.termo !== undefined ? filtro.termo.trim() : ''

  return tarefas.filter(tarefa => {
    const atendeEstado =
      filtro.estado === 'todas' ||
      (filtro.estado === 'abertas' && tarefa.concluida === false) ||
      (filtro.estado === 'concluidas' && tarefa.concluida === true)

    if (!atendeEstado) {
      return false
    }

    if (termo === '') {
      return true
    }

    return tarefa.titulo.toLowerCase().includes(termo.toLowerCase())
  })
}
