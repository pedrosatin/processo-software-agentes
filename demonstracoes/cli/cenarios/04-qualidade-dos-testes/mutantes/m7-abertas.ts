type Tarefa = { id: number, titulo: string, concluida: boolean }
type Filtro = { estado: string, termo?: string }

const porEstado: Record<string, (tarefa: Tarefa) => boolean> = {
  todas: () => true,
  abertas: tarefa => !tarefa.concluida,
  concluidas: tarefa => tarefa.concluida
}

// Defeito: estado abertas inclui tarefas concluídas
const porEstadoComDefeito: Record<string, (tarefa: Tarefa) => boolean> = { ...porEstado, abertas: () => true }

export const filtrarTarefas = (tarefas: Tarefa[], filtro: Filtro): Tarefa[] => {
  const doEstado = porEstadoComDefeito[filtro.estado]
  if (!doEstado) throw new Error('Estado inválido')
  const termo = (filtro.termo ?? '').trim().toLowerCase()
  return tarefas.filter(tarefa => doEstado(tarefa) && tarefa.titulo.toLowerCase().includes(termo))
}
