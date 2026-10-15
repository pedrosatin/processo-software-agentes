type Tarefa = { id: number, titulo: string, concluida: boolean }
type Filtro = { estado: string, termo?: string }

const estadosAceitos = ['todas', 'abertas', 'concluidas']

const atendeEstado = (tarefa: Tarefa, estado: string): boolean =>
  estado === 'todas' || (estado === 'abertas' ? !tarefa.concluida : tarefa.concluida)

const atendeTermo = (tarefa: Tarefa, termo: string): boolean =>
  termo === '' || tarefa.titulo.includes(termo)

export const filtrarTarefas = (tarefas: Tarefa[], filtro: Filtro): Tarefa[] => {
  if (!estadosAceitos.includes(filtro.estado)) throw new Error('Estado inválido')
  const termo = (filtro.termo ?? '').trim()
  return tarefas.filter(tarefa => atendeEstado(tarefa, filtro.estado) && atendeTermo(tarefa, termo))
}
