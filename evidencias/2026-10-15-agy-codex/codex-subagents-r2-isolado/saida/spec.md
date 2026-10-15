## Critérios
C01: Com estado `todas` e sem termo, a busca retorna todas as tarefas recebidas.
C02: Com estado `abertas` e sem termo, a busca retorna apenas as tarefas com `concluida: false`.
C03: Com estado `concluidas` e sem termo, a busca retorna apenas as tarefas com `concluida: true`.
C04: Com termo `compr`, a tarefa de título `Comprar pão` é encontrada, pois o termo pode aparecer em qualquer parte do título.
C05: Com termo `REVISAR`, a tarefa de título `Revisar código` é encontrada pela comparação do título e do termo com `toLowerCase()` do JavaScript, sem locale.
C06: Com termo `strasse`, a tarefa de título `Straße` não é encontrada.
C07: Com termo `relatorio`, a tarefa de título `Relatório` não é encontrada, pois os acentos contam.
C08: Com termo `  comprar  `, a tarefa de título `Comprar pão` é encontrada após remover os espaços nas pontas com `trim()` do JavaScript.
C09: Com termo `comprar  pão`, a tarefa de título `Comprar pão` não é encontrada, pois os espaços entre palavras contam.
C10: Com termo ausente, vazio ou formado só por espaços, a busca retorna todas as tarefas que atendem ao estado, sem filtrar pelo título.
C11: Com título `Caf\u00e9` e termo `Cafe\u0301`, a tarefa não é encontrada, pois não há normalização Unicode.
C12: Com estado `abertas` e termo `compr`, a busca retorna somente as tarefas abertas cujo título contém esse termo conforme as regras de comparação.
C13: Com estado fora de `todas`, `abertas` e `concluidas`, incluindo `ABERTAS` e ` abertas `, a busca lança `Error` com a mensagem `Estado inválido`, mesmo quando a lista recebida é vazia.
C14: Com tarefas que atendem aos filtros, o resultado mantém a ordem em que elas aparecem na lista recebida.
C15: Com qualquer lista e filtros válidos, a busca não altera a lista recebida.
C16: Com tarefas que atendem aos filtros, o resultado contém os próprios objetos recebidos, sem copiá-los.
C17: Com qualquer lista e filtros válidos, o resultado é um array novo, mesmo quando todas as tarefas entram ou a lista recebida está vazia.
C18: Com uma lista vazia e estado válido, ou quando nenhuma tarefa atende aos filtros, a busca retorna um array vazio.

## Dúvidas
Nenhuma dúvida em aberto.
