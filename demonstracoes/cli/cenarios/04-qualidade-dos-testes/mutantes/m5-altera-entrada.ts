type Tarefa = { id: number, titulo: string, concluida: boolean }
type Filtro = { estado: string, termo?: string }

const porEstado: Record<string, (tarefa: Tarefa) => boolean> = {
  todas: () => true,
  abertas: tarefa => !tarefa.concluida,
  concluidas: tarefa => tarefa.concluida
}

// Defeito: ordena a lista recebida por id, alterando a entrada
export const filtrarTarefas = (tarefas: Tarefa[], filtro: Filtro): Tarefa[] => {
  const doEstado = porEstado[filtro.estado]
  if (!doEstado) throw new Error('Estado inválido')
  const termo = (filtro.termo ?? '').trim().toLowerCase()
  return tarefas.sort((a, b) => a.id - b.id).filter(tarefa => doEstado(tarefa) && tarefa.titulo.toLowerCase().includes(termo))
}
