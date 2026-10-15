# Especificação

## Critérios

C01. Filtro com estado "todas" e sem termo retorna todas as tarefas da lista. Exemplo: para uma lista com tarefa aberta (id: 1) e tarefa concluída (id: 2), retorna ambas.
C02. Filtro com estado "abertas" e sem termo retorna apenas tarefas não concluídas. Exemplo: para uma lista com id: 1 (concluida: false) e id: 2 (concluida: true), retorna apenas id: 1.
C03. Filtro com estado "concluidas" e sem termo retorna apenas tarefas concluídas. Exemplo: para uma lista com id: 1 (concluida: false) e id: 2 (concluida: true), retorna apenas id: 2.
C04. Filtro com termo no título retorna tarefas cujo título contenha o termo. Exemplo: termo "código" encontra a tarefa com título "Revisar código".
C05. Filtro combinando estado "abertas" e termo no título retorna apenas tarefas não concluídas que atendam ao termo. Exemplo: estado "abertas" e termo "Revisar" retorna a tarefa não concluída com título "Revisar código".
C06. Filtro combinando estado "concluidas" e termo no título retorna apenas tarefas concluídas que atendam ao termo. Exemplo: estado "concluidas" e termo "Relatório" retorna a tarefa concluída com título "Relatório semanal".

## Dúvidas

- Maiúsculas e minúsculas: a busca por termo no título diferencia maiúsculas de minúsculas? Exemplo: termo "REVISAR" encontra a tarefa com título "Revisar código"?
- Acentuação: a busca por termo no título desconsidera acentos? Exemplo: termo "relatorio" encontra a tarefa com título "Relatório"?
- Correspondência parcial: o termo pode coincidir com qualquer parte do título (substring) ou apenas palavra inteira? Exemplo: termo "compr" encontra "Comprar pão"?
- Espaços e termo vazio: espaços no início e fim do termo devem ser removidos com trim? Termo vazio ou contendo apenas espaços filtra nada ou não encontra tarefas?
- Estado inválido: se o filtro receber um estado diferente de "todas", "abertas" e "concluidas" (por exemplo "arquivadas" ou "ABERTAS"), a função deve lançar um erro ou retornar lista vazia?
- Imutabilidade e ordenação: a lista original de tarefas deve ser mantida intacta (sem mutação) e o resultado deve preservar a ordem original das tarefas?
