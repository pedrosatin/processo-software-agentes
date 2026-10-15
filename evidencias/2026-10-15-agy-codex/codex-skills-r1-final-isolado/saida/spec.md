## Critérios
C01 Para uma lista de tarefas e o filtro { estado: 'todas' } sem termo, o resultado contém todas as tarefas da lista.
C02 Para uma lista de tarefas e o filtro { estado: 'abertas' } sem termo, o resultado contém somente as tarefas com concluida igual a false.
C03 Para uma lista de tarefas e o filtro { estado: 'concluidas' } sem termo, o resultado contém somente as tarefas com concluida igual a true.
C04 Para uma lista vazia e qualquer estado aceito, sem termo, o resultado é uma lista vazia.
C05 Para uma lista sem tarefas abertas e o filtro { estado: 'abertas' } sem termo, o resultado é uma lista vazia.
C06 Para uma lista sem tarefas concluídas e o filtro { estado: 'concluidas' } sem termo, o resultado é uma lista vazia.
C07 Para um estado aceito e um termo informado, o resultado contém apenas tarefas que atendem ao estado escolhido e à busca no título.

## Dúvidas
D01 Para uma tarefa com titulo 'Comprar pão' e termo 'pão', a busca deve encontrar trechos do título ou exigir o título completo?
D02 Para uma tarefa com titulo 'Comprar pão' e termo 'comprar pão', a busca deve encontrar a tarefa ou diferenciar letras maiúsculas e minúsculas?
D03 Para uma tarefa com titulo 'Comprar pão' e termo 'Comprar pao', a busca deve encontrar a tarefa ou diferenciar letras com e sem acento?
D04 Para termo '' ou composto somente de espaços, o resultado deve ser o mesmo de uma busca sem termo ou seguir outra regra?
D05 Para uma tarefa com titulo 'Comprar pão' e termo ' Comprar pão ', os espaços nas pontas do termo devem ser ignorados ou participar da busca?
D06 Para estado 'pendentes', que é uma string mas não está entre os estados aceitos, a função deve lançar um erro, retornar uma lista vazia ou ter outro comportamento?
D07 Para tarefas que correspondem ao filtro e aparecem na ordem de IDs [2, 1], o resultado deve manter essa ordem ou usar alguma ordenação?
D08 Para uma lista com tarefas abertas e concluídas filtrada por 'abertas', a lista recebida deve permanecer intacta ou pode ser alterada para conter apenas as tarefas encontradas?
