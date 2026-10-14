export type Tarefa = {
  id: number
  titulo: string
  concluida: boolean
}

const estadosValidos: string[] = ['todas', 'abertas', 'concluidas']

function atendeEstado(tarefa: Tarefa, estado: string): boolean {
  if (estado === 'abertas') {
    return tarefa.concluida === false
  }
  if (estado === 'concluidas') {
    return tarefa.concluida === true
  }
  return true
}

function atendeTermo(tarefa: Tarefa, termo: string): boolean {
  if (termo === '') {
    return true
  }
  return tarefa.titulo.toLowerCase().includes(termo)
}

export function filtrarTarefas(
  tarefas: Tarefa[],
  filtro: { estado: string, termo?: string }
): Tarefa[] {
  if (!estadosValidos.includes(filtro.estado)) {
    throw new Error('Estado inválido')
  }

  const termo = (filtro.termo ?? '').trim().toLowerCase()

  return tarefas.filter((tarefa) => atendeEstado(tarefa, filtro.estado) && atendeTermo(tarefa, termo))
}
