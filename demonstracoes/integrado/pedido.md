# Pedido

O suporte pediu uma busca na API de tarefas: filtrar tarefas por estado e por termo no título.

Tipo existente: `Tarefa = { id: number, titulo: string, concluida: boolean }`

Assinatura: `filtrarTarefas(tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[]`

Estados aceitos: `todas`, `abertas` e `concluidas`.
