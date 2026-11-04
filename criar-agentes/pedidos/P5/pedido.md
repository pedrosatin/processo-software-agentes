# Pedido P5. Agrupar por responsável

A reunião semanal precisa da lista de tarefas de cada pessoa do time.

Tipo: `Tarefa = { id: number, titulo: string, concluida: boolean, responsavel?: string }`

Assinatura: `agruparPorResponsavel(tarefas: Tarefa[]): Record<string, number[]>`

O código vai em `saida/agruparPorResponsavel.ts`, exportando a função `agruparPorResponsavel`.
