# Especificação

## Critérios

C01. Com estado 'todas' e termo ausente, retorna todas as tarefas recebidas.
C02. Com estado 'abertas' e termo ausente, retorna somente tarefas com concluida igual a false.
C03. Com estado 'concluidas' e termo ausente, retorna somente tarefas com concluida igual a true.
C04. Com estado fora de 'todas', 'abertas' e 'concluidas', inclusive 'ABERTAS' ou ' abertas ', lança Error com mensagem 'Estado inválido', mesmo com lista vazia.
C05. Com termo 'REVISAR', encontra o título 'Revisar código' após converter título e termo com toLowerCase() do JavaScript sem locale.
C06. Com termo 'strasse', não encontra o título 'Straße'.
C07. Com termo 'relatorio', não encontra o título 'Relatório', pois acentos contam.
C08. Com termo '  compr  ', encontra 'Comprar pão', removendo espaços nas extremidades com trim() do JavaScript.
C09. Com termo 'comprar  pão', não encontra 'Comprar pão', pois os espaços entre palavras contam.
C10. Com termo vazio ou composto somente de espaços, retorna as tarefas que atendem ao estado sem restringir pelo título.
C11. Com termo 'compr', encontra 'Comprar pão' porque o termo pode aparecer em qualquer parte do título.
C12. Com termo 'Revisar' e títulos sem essa sequência após a conversão de maiúsculas e minúsculas, retorna lista vazia.
C13. Com termo 'é' em U+00E9, não encontra título 'é' composto por U+0065 e U+0301, pois não há normalização Unicode.
C14. Com estado 'abertas' e termo 'compr', retorna somente as tarefas abertas cujo título contém 'compr' após o tratamento definido do termo.
C15. Com tarefas correspondentes em posições diferentes da lista, retorna essas tarefas na mesma ordem em que foram recebidas.
C16. Após filtrar qualquer lista de tarefas válida, a lista recebida permanece inalterada.
C17. Com tarefas correspondentes ao filtro, os objetos retornados são os próprios objetos recebidos, sem cópia.
C18. Com qualquer filtro válido, retorna sempre um array novo, mesmo quando todas as tarefas entram ou a lista recebida é vazia.
C19. Com lista vazia e estado válido, retorna uma lista vazia.

## Dúvidas

Nenhuma.
