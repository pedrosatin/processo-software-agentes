# Especificação

## Critérios

C01. Com estado "todas" e sem termo, `filtrarTarefas` devolve todas as tarefas da lista, na mesma ordem.
C02. Com estado "abertas", devolve somente as tarefas com `concluida` igual a false, na ordem recebida.
C03. Com estado "concluidas", devolve somente as tarefas com `concluida` igual a true, na ordem recebida.
C04. Com estado fora de "todas", "abertas" e "concluidas" (por exemplo "pendentes"), lança Error com a mensagem "Estado inválido".
C05. Com estado "ABERTAS" ou " abertas " (com maiúsculas ou espaços), lança Error com a mensagem "Estado inválido".
C06. Com estado inválido e lista de tarefas vazia, lança Error com a mensagem "Estado inválido".
C07. Com termo "REVISAR" e título "Revisar código", a tarefa entra no resultado, pois a comparação ignora maiúsculas e minúsculas.
C08. Com termo "strasse" e título "Straße", a tarefa não entra no resultado.
C09. Com termo "relatorio" e título "Relatório", a tarefa não entra no resultado, pois acentos contam.
C10. Com termo "  compr  " (espaços no começo e no fim) e título "Comprar pão", a tarefa entra no resultado, pois o termo é aparado antes da comparação.
C11. Com termo "comprar  pão" (dois espaços entre as palavras) e título "Comprar pão", a tarefa não entra no resultado, pois espaços entre palavras contam.
C12. Com termo vazio "", termo só com espaços "   " ou sem termo, o filtro por título não remove nenhuma tarefa.
C13. Com termo "compr" e título "Comprar pão", a tarefa entra no resultado, pois o termo pode estar em qualquer parte do título.
C14. Com estado "abertas" e termo "compr", só entram tarefas abertas cujo título contém "compr"; tarefas concluídas com esse termo ficam de fora.
C15. Com estado "concluidas" e termo "pão", só entram tarefas concluídas cujo título contém "pão"; tarefas abertas com esse termo ficam de fora.
C16. Com termo que aparece em título com letras maiúsculas e minúsculas mistas, como "Comprar Pão" e termo "PÃO", a tarefa entra no resultado, pois a comparação usa toLowerCase() do JavaScript sem locale.
C17. Com título contendo a mesma letra acentuada em duas codificações Unicode diferentes e termo na outra codificação, a tarefa não entra no resultado, pois não há normalização Unicode.
C18. Após a chamada, a lista de tarefas recebida permanece igual: mesmos itens, mesma ordem e mesmos valores.
C19. O resultado contém os mesmos objetos da lista recebida (a mesma referência, sem cópia), e não objetos novos.
C20. Com lista de tarefas vazia e estado válido, devolve uma lista vazia.

## Dúvidas

Nenhuma.
