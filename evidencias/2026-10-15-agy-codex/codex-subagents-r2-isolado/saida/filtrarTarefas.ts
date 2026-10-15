export type Tarefa = {
  id: number
  titulo: string
  concluida: boolean
}

export function filtrarTarefas(
  tarefas: Tarefa[],
  filtro: { estado: string, termo?: string }
): Tarefa[] {
  const { estado } = filtro

  if (estado !== 'todas' && estado !== 'abertas' && estado !== 'concluidas') {
    throw new Error('Estado inválido')
  }

  const termo = (filtro.termo ?? '').trim().toLowerCase()

  return tarefas.filter(tarefa => {
    const correspondeAoEstado = estado === 'todas'
      || (estado === 'abertas' && tarefa.concluida === false)
      || (estado === 'concluidas' && tarefa.concluida === true)

    return correspondeAoEstado && tarefa.titulo.toLowerCase().includes(termo)
  })
}
