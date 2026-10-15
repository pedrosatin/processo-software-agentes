# Especificação

## Critérios

C01. Com lista contendo tarefas abertas e tarefas concluídas e filtro com estado 'todas', retorna todas as tarefas da lista.
C02. Com lista de tarefas e filtro com estado 'abertas', retorna apenas as tarefas com concluida false.
C03. Com lista de tarefas e filtro com estado 'concluidas', retorna apenas as tarefas com concluida true.
C04. Com filtro contendo estado fora da lista aceita como 'ABERTAS', lança Error com a mensagem 'Estado inválido'.
C05. Com filtro contendo estado com espaços como ' abertas ', lança Error com a mensagem 'Estado inválido'.
C06. Com lista de tarefas vazia e estado fora da lista aceita como 'invalido', lança Error com a mensagem 'Estado inválido'.
C07. Com termo em maiúsculas 'REVISAR', encontra a tarefa com título 'Revisar código'.
C08. Com termo 'strasse', não encontra a tarefa com título 'Straße' devido à conversão sem locale.
C09. Com termo sem acento 'relatorio', não encontra a tarefa com título 'Relatório' pois acentos contam.
C10. Com termo contendo espaços no início e no fim como '  comprar  ', encontra a tarefa com título 'Comprar pão'.
C11. Com termo contendo espaços extras entre palavras como 'comprar  pão', não encontra a tarefa com título 'comprar pão'.
C12. Com termo ausente no filtro, não filtra por título e retorna as tarefas que atendem ao estado.
C13. Com termo vazio '' no filtro, não filtra por título e retorna as tarefas que atendem ao estado.
C14. Com termo composto apenas por espaços '   ' no filtro, não filtra por título e retorna as tarefas que atendem ao estado.
C15. Com termo contendo trecho do título como 'compr', encontra a tarefa com título 'Comprar pão'.
C16. Com termo em codificação Unicode decomposta 'e\u0301', não encontra a tarefa com título em codificação pré-composta 'é'.
C17. Com filtro contendo estado e termo, retorna apenas tarefas que atendem simultaneamente ao estado e ao termo especificados.
C18. O resultado segue a mesma ordem relativa das tarefas presentes na lista recebida.
C19. A lista de tarefas recebida como entrada não é modificada após a execução da função.
C20. O resultado traz as próprias referências dos objetos de tarefas da lista recebida, sem criar cópias.
C21. O resultado retornado é sempre uma nova instância de array, com referência distinta da lista recebida.

## Dúvidas

Nenhuma.
