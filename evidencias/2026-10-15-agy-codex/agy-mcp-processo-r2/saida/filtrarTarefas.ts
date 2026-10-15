export type Tarefa = { id: number, titulo: string, concluida: boolean }

const estados: Record<string, (t: Tarefa) => boolean> = {
  todas: () => true,
  abertas: t => !t.concluida,
  concluidas: t => t.concluida
}

export const filtrarTarefas = (tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[] => {
  if (!Object.hasOwn(estados, filtro.estado)) throw new Error('Estado inválido')
  const porEstado = estados[filtro.estado]
  const termo = (filtro.termo ?? '').trim()
  if (termo === '') return tarefas.filter(porEstado)
  const termoLower = termo.toLowerCase()
  return tarefas.filter(t => porEstado(t) && t.titulo.toLowerCase().includes(termoLower))
}
