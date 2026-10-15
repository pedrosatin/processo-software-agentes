## Critérios
C01 Com estado `todas`, entram todas as tarefas que atendem ao termo, sejam abertas ou concluídas.
C02 Com estado `abertas`, entram apenas tarefas com `concluida: false` que atendem ao termo.
C03 Com estado `concluidas`, entram apenas tarefas com `concluida: true` que atendem ao termo.
C04 Com estado diferente de `todas`, `abertas` ou `concluidas`, incluindo `ABERTAS` e ` abertas `, lança Error com mensagem `Estado inválido`, mesmo com lista vazia.
C05 Com termo ausente, vazio ou composto apenas de espaços removíveis por trim() do JavaScript, não há restrição pelo título.
C06 Com termo contendo espaços no início ou no fim, a busca usa o termo após trim() do JavaScript; espaços internos continuam contando.
C07 Com termo não vazio, entram títulos que contenham o termo em qualquer posição, após converter ambos com toLowerCase() do JavaScript, sem locale; `REVISAR` encontra `Revisar código` e `strasse` não encontra `Straße`.
C08 Com termo `relatorio`, o título `Relatório` não entra, pois os acentos contam.
C09 Com título e termo usando codificações Unicode diferentes do mesmo acento, não há normalização para torná-los iguais.
C10 Com estado e termo informados, entram somente tarefas que atendam simultaneamente aos dois filtros.
C11 Com tarefas que atendem aos filtros, o resultado preserva a ordem em que aparecem na lista recebida.
C12 Após qualquer filtragem válida, a lista recebida e seus objetos permanecem inalterados.
C13 Com tarefas selecionadas, os objetos do resultado são os próprios objetos recebidos, sem cópias.
C14 Com qualquer filtragem válida, o resultado é um array novo, inclusive quando todas as tarefas entram ou a lista recebida está vazia.
C15 Com lista vazia e estado válido, o resultado é um array vazio.

## Dúvidas
Nenhuma.
