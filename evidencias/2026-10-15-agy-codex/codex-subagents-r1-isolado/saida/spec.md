## Critérios
C01 — Para uma lista vazia de tarefas e estado `todas`, sem termo, a busca retorna uma lista vazia.
C02 — Para tarefas abertas e concluídas e estado `todas`, sem termo, a busca retorna todas as tarefas.
C03 — Para tarefas abertas e concluídas e estado `abertas`, sem termo, a busca retorna somente tarefas com `concluida: false`.
C04 — Para tarefas abertas e concluídas e estado `concluidas`, sem termo, a busca retorna somente tarefas com `concluida: true`.
C05 — Para um termo informado, a busca considera o título da tarefa.

## Dúvidas
D01 — Para título `Comprar leite` e termo `leite`, a tarefa deve ser encontrada por conter o termo ou a busca exige título inteiro igual ao termo? Há outra regra de correspondência desejada?
D02 — Para título `Comprar leite` e termo `comprar leite`, a busca deve ignorar diferenças entre maiúsculas e minúsculas?
D03 — Para título `Revisão` e termo `Revisao`, a busca deve ignorar acentos?
D04 — Para título `Comprar leite` e termo ` Comprar leite `, os espaços nas pontas do termo devem ser removidos antes da busca?
D05 — Para termo vazio (`''`) ou composto apenas de espaços, a busca deve retornar todas as tarefas do estado escolhido ou aplicar outro comportamento?
D06 — Quando estado e termo são informados juntos, a tarefa precisa atender aos dois filtros ou basta atender a um deles?
D07 — Para um estado não reconhecido, como `pendentes` (permitido pelo tipo `string`), a função deve lançar erro, retornar lista vazia ou ter outro comportamento? Estados com maiúsculas ou espaços, como `TODAS` e ` todas `, devem ser reconhecidos?
D08 — Se as tarefas correspondentes aparecem na entrada na ordem de IDs `3, 1, 2`, o resultado deve manter essa ordem ou ordenar as tarefas por algum campo?
D09 — Depois de executar a busca, a lista original e os objetos de tarefa devem permanecer inalterados? Os objetos retornados devem ser os originais ou cópias?
