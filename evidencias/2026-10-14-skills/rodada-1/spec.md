# Especificação: filtrarTarefas

Assinatura: `filtrarTarefas(tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[]`
Tipo: `Tarefa = { id: number, titulo: string, concluida: boolean }`
Estados aceitos: `todas`, `abertas`, `concluidas`.

## Critérios

C01 - Dada a lista de tarefas e o filtro `{ estado: "todas" }` sem termo, o resultado contém todas as tarefas da lista.
C02 - Dada a lista de tarefas e o filtro `{ estado: "abertas" }` sem termo, o resultado contém somente as tarefas com `concluida: false`.
C03 - Dada a lista de tarefas e o filtro `{ estado: "concluidas" }` sem termo, o resultado contém somente as tarefas com `concluida: true`.
C04 - Dada a lista de tarefas e o filtro `{ estado: "todas", termo: "pão" }`, o resultado contém somente as tarefas cujo título contém "pão".
C05 - Dada a lista de tarefas e o filtro `{ estado: "abertas", termo: "pão" }`, o resultado contém somente as tarefas abertas cujo título contém "pão".
C06 - Dada uma lista de tarefas vazia e qualquer filtro válido, o resultado é uma lista vazia.
C07 - Dado um termo que não aparece no título de nenhuma tarefa, o resultado é uma lista vazia.

## Dúvidas

D01 - Diferença entre maiúsculas e minúsculas no termo. Entrada: tarefa com título "Comprar Pão", filtro `{ estado: "todas", termo: "pão" }`.
  - Resultado A: a tarefa é incluída (comparação sem distinguir maiúsculas).
  - Resultado B: a tarefa não é incluída (comparação exata).

D02 - Acentos no termo. Entrada: tarefa com título "Café da manhã", filtro `{ estado: "todas", termo: "cafe" }`.
  - Resultado A: a tarefa é incluída (acentos ignorados).
  - Resultado B: a tarefa não é incluída (comparação literal).

D03 - Termo que cobre só parte de uma palavra. Entrada: tarefa com título "Comprar pão", filtro `{ estado: "todas", termo: "compr" }`.
  - Resultado A: a tarefa é incluída (o termo é trecho do título).
  - Resultado B: a tarefa não é incluída (o termo precisa ser palavra inteira).

D04 - Termo composto só por espaços. Entrada: filtro `{ estado: "abertas", termo: "   " }` sobre uma lista com tarefas abertas.
  - Resultado A: o termo é tratado como ausente e retorna todas as tarefas abertas.
  - Resultado B: o termo é buscado literalmente e, como nenhum título costuma conter só espaços, retorna lista vazia.

D05 - Estado fora dos aceitos, mas do tipo `string`. Entrada: filtro `{ estado: "pendentes" }` (ou `"Abertas"`, com inicial maiúscula).
  - Resultado A: a função lança um erro.
  - Resultado B: a função retorna lista vazia.
