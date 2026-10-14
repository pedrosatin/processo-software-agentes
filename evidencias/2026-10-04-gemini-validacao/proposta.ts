type Tarefa = {
  id: string
  titulo: string
  concluida: boolean
}

type Filtro = {
  estado: string
  termo?: string
}

export const filtrarTarefas = (tarefas: Tarefa[], filtro: Filtro): Tarefa[] => {
  const estadosValidos = ['todas', 'abertas', 'concluidas']
  if (!estadosValidos.includes(filtro.estado)) {
    throw new Error('Estado inválido')
  }

  const termoLimpo = filtro.termo !== undefined ? filtro.termo.trim() : ''

  return tarefas.filter(tarefa => {
    let atendeEstado = true
    if (filtro.estado === 'abertas') {
      atendeEstado = tarefa.concluida === false
    } else if (filtro.estado === 'concluidas') {
      atendeEstado = tarefa.concluida === true
    }

    let atendeTermo = true
    if (termoLimpo !== '') {
      atendeTermo = tarefa.titulo.includes(termoLimpo)
    }

    return atendeEstado && atendeTermo
  })
}
