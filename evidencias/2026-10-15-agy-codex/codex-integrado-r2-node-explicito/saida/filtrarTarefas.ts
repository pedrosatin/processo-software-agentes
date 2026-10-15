export type Tarefa = {
  id: number
  titulo: string
  concluida: boolean
}

export function filtrarTarefas(
  tarefas: readonly Tarefa[],
  filtro: { estado: string, termo?: string }
): Tarefa[] {
  const { estado, termo } = filtro

  if (estado !== 'todas' && estado !== 'abertas' && estado !== 'concluidas') {
    throw new Error('Estado inválido')
  }

  const busca = (termo ?? '').trim().toLowerCase()

  return tarefas.filter(tarefa => {
    const correspondeEstado = estado === 'todas'
      || (estado === 'abertas' && tarefa.concluida === false)
      || (estado === 'concluidas' && tarefa.concluida === true)

    return correspondeEstado && tarefa.titulo.toLowerCase().includes(busca)
  })
}
