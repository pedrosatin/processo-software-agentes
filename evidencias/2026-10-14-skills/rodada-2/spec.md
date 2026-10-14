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
C08 - Dado o termo "pão" e a tarefa com título "Comprar Pão", a tarefa entra no resultado, porque maiúsculas e minúsculas não importam.
C09 - Dado o termo "REVISAR" e a tarefa com título "Revisar código", a tarefa entra no resultado.
C10 - Dado o termo "strasse" e a tarefa com título "Straße", a tarefa não entra no resultado, porque a conversão usa `toLowerCase()` sem locale.
C11 - Dado o termo "relatorio" e a tarefa com título "Relatório", a tarefa não entra no resultado, porque acentos contam.
C12 - Dado o termo "  pão  " com espaços no começo e no fim, o resultado é o mesmo que para o termo "pão".
C13 - Dado o termo "compr" e a tarefa com título "Comprar pão", a tarefa entra no resultado, porque o termo pode aparecer em qualquer parte do título.
C14 - Dado o termo "revisar  código" com dois espaços entre as palavras e a tarefa com título "Revisar código", a tarefa não entra no resultado, porque espaços entre palavras contam.
C15 - Dado um termo vazio "", um termo só com espaços "   " ou um filtro sem termo, o resultado contém todas as tarefas do estado pedido, sem filtrar pelo título.
C16 - Dado o estado "ABERTAS" ou " abertas ", a função lança `Error` com a mensagem "Estado inválido".
C17 - Dado o estado "pendentes", a função lança `Error` com a mensagem "Estado inválido", mesmo quando a lista de tarefas está vazia.
C18 - Dado um título com "é" em um único caractere e um termo com "e" seguido de acento combinado (U+0301), a tarefa não entra no resultado, porque não há normalização Unicode.
C19 - Dada a lista de tarefas, o resultado segue a ordem em que as tarefas aparecem na lista recebida.
C20 - Após a chamada, a lista de tarefas recebida tem os mesmos elementos, na mesma ordem, que tinha antes da chamada.
C21 - O resultado contém os próprios objetos da lista recebida, sem cópia, de modo que `resultado[0] === tarefas[i]` para a mesma tarefa.

## Dúvidas

Nenhuma. Todas as dúvidas levantadas no pedido foram respondidas em `respostas.md`.
