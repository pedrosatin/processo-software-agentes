# Especificação

## Critérios

C01. Dado a tarefa "Revisar código" e o termo "REVISAR" com estado "todas", filtrarTarefas retorna a tarefa "Revisar código".
C02. Dado a tarefa "Straße" e o termo "strasse", filtrarTarefas não retorna a tarefa "Straße".
C03. Dado a tarefa "Relatório" e o termo "relatorio", filtrarTarefas não retorna a tarefa "Relatório".
C04. Dado a tarefa "Comprar pão" e o termo "  compr  " (com espaços no começo e no fim), filtrarTarefas retorna a tarefa "Comprar pão".
C05. Dado o termo "   " (só espaços), filtrarTarefas não filtra pelo título e retorna as tarefas que atendem apenas ao estado.
C06. Dado o filtro sem termo (termo ausente) com estado "todas", filtrarTarefas não filtra pelo título e retorna todas as tarefas da lista.
C07. Dado o termo "" (vazio) com estado "abertas", filtrarTarefas não filtra pelo título e retorna as tarefas abertas.
C08. Dado a tarefa "Comprar pão" e o termo "compr", filtrarTarefas retorna a tarefa (termo no início do título).
C09. Dado a tarefa "Comprar pão" e o termo "pão", filtrarTarefas retorna a tarefa (termo no fim do título).
C10. Dado a tarefa "Revisar código" e o termo "revisar código" (um espaço entre as palavras), filtrarTarefas retorna a tarefa.
C11. Dado a tarefa "Revisar código" e o termo "revisar  código" (dois espaços entre as palavras), filtrarTarefas não retorna a tarefa.
C12. Dado a tarefa "Relatório" com acento em forma precomposta (U+00E9) e o termo com o mesmo acento em forma decomposta (e + U+0301), filtrarTarefas não retorna a tarefa.
C13. Dado o estado "ABERTAS", filtrarTarefas lança Error com a mensagem "Estado inválido".
C14. Dado o estado " abertas " (com espaços), filtrarTarefas lança Error com a mensagem "Estado inválido".
C15. Dado o estado "pendentes" com lista de tarefas vazia, filtrarTarefas lança Error com a mensagem "Estado inválido".
C16. Dado o estado "todas", filtrarTarefas retorna todas as tarefas da lista, abertas e concluídas.
C17. Dado o estado "abertas", filtrarTarefas retorna apenas as tarefas com concluida igual a false.
C18. Dado o estado "concluidas", filtrarTarefas retorna apenas as tarefas com concluida igual a true.
C19. Dado uma lista de tarefas com estado válido, filtrarTarefas retorna as tarefas na mesma ordem em que aparecem na lista recebida.
C20. Dado uma lista de tarefas, após chamar filtrarTarefas a lista recebida permanece com os mesmos elementos e na mesma ordem.
C21. Dado a tarefa "Revisar código" concluída (concluida true), o estado "abertas" e o termo "revisar", filtrarTarefas não retorna a tarefa.
C22. Dado a tarefa "Revisar código" aberta (concluida false), o estado "abertas" e o termo "revisar", filtrarTarefas retorna a tarefa.
C23. Dado a tarefa "Revisar código" aberta (concluida false), o estado "concluidas" e o termo "revisar", filtrarTarefas não retorna a tarefa.
C24. Dado uma lista de tarefas com estado válido, os objetos do resultado são as mesmas referências dos objetos da lista recebida (sem cópia).
C25. Dado uma lista de tarefas vazia e estado válido, filtrarTarefas retorna uma lista vazia.

## Dúvidas

- Quando o estado é "todas" e não há termo filtrando, o resultado deve ser um novo array ou pode ser a mesma referência do array recebido? As respostas dizem que os objetos não são copiados e que a lista recebida não é alterada, mas não dizem se o array devolvido é uma instância nova. Os dois comportamentos são possíveis dentro das respostas dadas.
