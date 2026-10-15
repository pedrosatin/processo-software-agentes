# Especificação

## Critérios

C01. Com estado todas, o resultado inclui tarefas abertas e concluídas.
C02. Com estado abertas, o resultado inclui somente tarefas com concluida false.
C03. Com estado concluidas, o resultado inclui somente tarefas com concluida true.
C04. Com estado diferente exatamente de todas, abertas ou concluidas, lança Error com mensagem Estado inválido, inclusive para lista vazia.
C05. Com termo informado, encontra sua ocorrência em qualquer parte do título, convertendo ambos com toLowerCase() do JavaScript sem locale.
C06. Com termo contendo acentos ou codificações Unicode distintas, a busca preserva essas diferenças, sem remover acentos nem normalizar Unicode.
C07. Com espaços nas extremidades do termo, remove-os com trim() do JavaScript e preserva os espaços internos na busca.
C08. Com termo ausente, vazio ou somente espaços, não restringe tarefas pelo título.
C09. Com estado e termo informados, retorna somente as tarefas que atendem aos dois filtros.
C10. Com qualquer lista recebida, mantém sua ordem e não altera a lista de entrada.
C11. Com qualquer filtro válido, retorna sempre um array novo contendo os próprios objetos da entrada, inclusive quando todas as tarefas entram.
C12. Com lista vazia e estado válido, retorna um array vazio.

## Dúvidas

Nenhuma.
