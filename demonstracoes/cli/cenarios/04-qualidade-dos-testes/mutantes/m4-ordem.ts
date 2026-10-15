type Tarefa = { id: number, titulo: string, concluida: boolean }
type Filtro = { estado: string, termo?: string }

const porEstado: Record<string, (tarefa: Tarefa) => boolean> = {
  todas: () => true,
  abertas: tarefa => !tarefa.concluida,
  concluidas: tarefa => tarefa.concluida
}

// Defeito: ordena o resultado pelo título
export const filtrarTarefas = (tarefas: Tarefa[], filtro: Filtro): Tarefa[] => {
  const doEstado = porEstado[filtro.estado]
  if (!doEstado) throw new Error('Estado inválido')
  const termo = (filtro.termo ?? '').trim().toLowerCase()
  const filtradas = tarefas.filter(tarefa => doEstado(tarefa) && tarefa.titulo.toLowerCase().includes(termo))
  return filtradas.toSorted((a, b) => a.titulo.localeCompare(b.titulo))
}
