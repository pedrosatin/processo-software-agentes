# Especificação

## Critérios

C01. Dado estado "todas", sem termo, e uma lista [A(concluida=false), B(concluida=true)], filtrarTarefas retorna [A, B], na mesma ordem da lista recebida.
C02. Dado estado "abertas", sem termo, e uma lista com tarefas abertas e concluídas, filtrarTarefas retorna somente as tarefas com concluida=false.
C03. Dado estado "concluidas", sem termo, e uma lista com tarefas abertas e concluídas, filtrarTarefas retorna somente as tarefas com concluida=true.
C04. Dado o termo "REVISAR" e a tarefa de título "Revisar código", a tarefa entra no resultado.
C05. Dado o termo "strasse" e a tarefa de título "Straße", a tarefa não entra no resultado.
C06. Dado o termo "relatorio" e a tarefa de título "Relatório", a tarefa não entra no resultado.
C07. Dado o termo "  compr  " (com espaços no começo e no fim) e a tarefa de título "Comprar pão", a tarefa entra no resultado, pois o termo é aplicado após trim().
C08. Dado o termo "   " (somente espaços), o filtro por título não é aplicado e todas as tarefas do estado escolhido são retornadas.
C09. Dado o termo "" (vazio) ou sem termo informado, o filtro por título não é aplicado e todas as tarefas do estado escolhido são retornadas.
C10. Dado o termo "compr" e a tarefa de título "Comprar pão", a tarefa entra no resultado, pois o termo pode aparecer no início do título.
C11. Dado o termo "ar p" e a tarefa de título "Comprar pão", a tarefa entra no resultado, pois o termo pode aparecer no meio do título.
C12. Dado o termo "comprar  pão" (com dois espaços entre as palavras) e a tarefa de título "Comprar pão", a tarefa não entra no resultado.
C13. Dado o termo "pão" e a tarefa de título "Comprar pao" (sem acento), a tarefa não entra no resultado.
C14. Dado um termo com "é" escrito como e seguido de acento combinante (U+0301) e uma tarefa cujo título tem "é" escrito como caractere único (U+00E9), a tarefa não entra no resultado.
C15. Dado estado "abertas" e termo "revisar", somente tarefas abertas cujo título contém "revisar" (sem diferenciar maiúsculas e minúsculas) entram no resultado; uma tarefa concluída com título "Revisar código" não entra.
C16. Dado estado "ABERTAS", " abertas " ou "pendentes", filtrarTarefas lança Error com a mensagem "Estado inválido".
C17. Dado estado inválido (por exemplo "ABERTAS") e uma lista de tarefas vazia, filtrarTarefas lança Error com a mensagem "Estado inválido".
C18. Dado estado válido (por exemplo "abertas") e uma lista de tarefas vazia, filtrarTarefas retorna um array vazio.
C19. Dado estado "todas" sem termo e uma lista não vazia, o resultado é um array diferente (!==) da lista recebida, mesmo contendo os mesmos elementos.
C20. Dado qualquer filtro que retorne tarefas, cada objeto do resultado é o mesmo objeto (===) da lista recebida, sem cópia.
C21. Após chamar filtrarTarefas, a lista recebida mantém o mesmo tamanho, a mesma ordem e os mesmos objetos que tinha antes da chamada.
C22. Dado um termo que casa com várias tarefas, as tarefas do resultado seguem a ordem em que aparecem na lista recebida.

## Dúvidas

Nenhuma.
