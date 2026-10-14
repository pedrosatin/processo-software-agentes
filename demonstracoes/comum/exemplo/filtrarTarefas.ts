export type Tarefa = { id: number, titulo: string, concluida: boolean }

const estados: Record<string, (tarefa: Tarefa) => boolean> = {
  todas: () => true,
  abertas: tarefa => !tarefa.concluida,
  concluidas: tarefa => tarefa.concluida
}

export const filtrarTarefas = (tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[] => {
  if (!Object.hasOwn(estados, filtro.estado)) throw new Error('Estado inválido')
  const porEstado = estados[filtro.estado]
  const termo = (filtro.termo ?? '').trim().toLowerCase()
  return tarefas.filter(tarefa => porEstado(tarefa) && tarefa.titulo.toLowerCase().includes(termo))
}
