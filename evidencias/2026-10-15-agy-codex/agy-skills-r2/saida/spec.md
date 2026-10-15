# Especificação

## Critérios
C01: Filtrar com estado "todas" e sem termo retorna todas as tarefas na mesma ordem original.
C02: Filtrar com estado "abertas" retorna apenas tarefas não concluídas.
C03: Filtrar com estado "concluidas" retorna apenas tarefas concluídas.
C04: Filtrar com estado diferente de "todas", "abertas" ou "concluidas" lança Error com a mensagem "Estado inválido".
C05: Filtrar com termo no título encontra correspondências em qualquer posição sem diferenciar maiúsculas e minúsculas.
C06: Filtrar com termo diferencia acentuação exata no título.
C07: Filtrar com termo remove espaços no início e no fim antes de comparar com o título.
C08: Filtrar com termo ausente, vazio ou composto apenas de espaços não filtra por título.
C09: Filtrar com estado e termo juntos retorna apenas as tarefas que atendem a ambos os filtros.
C10: Filtrar tarefas não modifica o array de entrada e retorna um novo array com as referências originais das tarefas.

## Dúvidas
Nenhuma dúvida em aberto.
