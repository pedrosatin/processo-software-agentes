# Especificação: filtrarTarefas

Fonte: pedido.md. Respostas anteriores: nenhuma (respostas.md está sem respostas).

Assinatura: `filtrarTarefas(tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[]`
Tipo: `Tarefa = { id: number, titulo: string, concluida: boolean }`
Estados aceitos: `todas`, `abertas`, `concluidas`.

## Critérios

C01. Com estado `todas` e sem termo, a entrada com três tarefas (duas abertas e uma concluída) retorna as três tarefas.
C02. Com estado `abertas` e sem termo, a entrada com duas abertas e uma concluída retorna somente as duas tarefas com `concluida` falso.
C03. Com estado `concluidas` e sem termo, a entrada com duas abertas e uma concluída retorna somente a tarefa com `concluida` verdadeiro.
C04. Com estado `todas` e termo `"relatorio"`, a entrada com os títulos "Relatorio mensal", "Compras" e "Revisar relatorio" retorna as tarefas "Relatorio mensal" e "Revisar relatorio", nessa ordem.
C05. Com estado `abertas` e termo `"compra"`, a entrada com "Compra de papel" aberta e "Compra de tinta" concluída retorna somente "Compra de papel".
C06. Com estado `concluidas` e termo `"xyz"` que não aparece em nenhum título, a entrada retorna lista vazia.
C07. Com uma lista de tarefas vazia, qualquer estado aceito retorna lista vazia.
C08. O resultado mantém a ordem original das tarefas da entrada.
C09. A lista de entrada não é alterada após a chamada.
C10. Com termo informado como string vazia `""`, o resultado é igual ao obtido sem termo para o mesmo estado.

## Dúvidas

D01. Com termo `"RELATORIO"` e a entrada contendo "Relatorio mensal", o termo casa com o título sem diferenciar maiúsculas de minúsculas, ou a busca diferencia maiúsculas de minúsculas e não retorna essa tarefa?

D02. Com termo `"relatório"` (com acento) e a entrada contendo "Relatorio mensal", a busca ignora acentos e retorna a tarefa, ou não retorna a tarefa?

D03. Com termo `"  compra  "` (com espaços nas bordas), os espaços são removidos antes de buscar, ou são considerados como parte do termo?

D04. Com termo `"mensal"` e título "Relatorio mensal", o termo casa com qualquer trecho do título (busca por substring), ou somente com palavras inteiras?

D05. Com estado fora dos aceitos, por exemplo `"pendentes"`, a função lança erro, retorna lista vazia, ou retorna todas as tarefas?

D06. Com estado `"ABERTAS"` (em maiúsculas), o valor é aceito como `abertas`, ou é tratado como estado inválido?
