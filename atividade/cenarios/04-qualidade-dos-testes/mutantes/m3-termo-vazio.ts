type Tarefa = { id: number, titulo: string, concluida: boolean }
type Filtro = { estado: string, termo?: string }

const porEstado: Record<string, (tarefa: Tarefa) => boolean> = {
  todas: () => true,
  abertas: tarefa => !tarefa.concluida,
  concluidas: tarefa => tarefa.concluida
}

// Defeito: termo só com espaços devolve lista vazia
export const filtrarTarefas = (tarefas: Tarefa[], filtro: Filtro): Tarefa[] => {
  const doEstado = porEstado[filtro.estado]
  if (!doEstado) throw new Error('Estado inválido')
  if (filtro.termo !== undefined && filtro.termo.trim() === '') return []
  const termo = (filtro.termo ?? '').trim().toLowerCase()
  return tarefas.filter(tarefa => doEstado(tarefa) && tarefa.titulo.toLowerCase().includes(termo))
}
