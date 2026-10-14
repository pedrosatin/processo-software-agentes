type Tarefa = { id: number, titulo: string, concluida: boolean }
type Filtro = { estado: string, termo?: string }

const porEstado: Record<string, (tarefa: Tarefa) => boolean> = {
  todas: () => true,
  abertas: tarefa => !tarefa.concluida,
  concluidas: tarefa => tarefa.concluida
}

// Defeito: estado desconhecido é tratado como todas
export const filtrarTarefas = (tarefas: Tarefa[], filtro: Filtro): Tarefa[] => {
  const doEstado = porEstado[filtro.estado] ?? porEstado.todas
  const termo = (filtro.termo ?? '').trim().toLowerCase()
  return tarefas.filter(tarefa => doEstado(tarefa) && tarefa.titulo.toLowerCase().includes(termo))
}
