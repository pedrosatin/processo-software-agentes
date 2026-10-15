export type Tarefa = {
  id: number
  titulo: string
  concluida: boolean
}

export const filtrarTarefas = (
  tarefas: Tarefa[],
  filtro: { estado: string, termo?: string }
): Tarefa[] => {
  if (filtro.estado !== 'todas' && filtro.estado !== 'abertas' && filtro.estado !== 'concluidas') {
    throw new Error('Estado inválido')
  }

  const termoLimpo = filtro.termo ? filtro.termo.trim().toLowerCase() : ''

  return tarefas.filter(tarefa => {
    const atendeEstado =
      filtro.estado === 'todas' ||
      (filtro.estado === 'abertas' && tarefa.concluida === false) ||
      (filtro.estado === 'concluidas' && tarefa.concluida === true)

    const atendeTermo =
      termoLimpo === '' || tarefa.titulo.toLowerCase().includes(termoLimpo)

    return atendeEstado && atendeTermo
  })
}
