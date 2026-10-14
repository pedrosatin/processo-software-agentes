# Especificação

## Critérios

C01. Dado o estado "todas" e nenhum termo, filtrarTarefas devolve todas as tarefas recebidas, na mesma ordem.
C02. Dado o estado "abertas" e nenhum termo, filtrarTarefas devolve somente as tarefas com concluida igual a false.
C03. Dado o estado "concluidas" e nenhum termo, filtrarTarefas devolve somente as tarefas com concluida igual a true.
C04. Dado um termo que aparece no titulo de algumas tarefas, filtrarTarefas devolve somente as tarefas cujo titulo contém esse termo, respeitando também o estado informado.
C05. Dado um termo que não aparece no titulo de nenhuma tarefa, filtrarTarefas devolve uma lista vazia.
C06. Dada uma lista de tarefas vazia, filtrarTarefas devolve uma lista vazia para qualquer estado aceito.
C07. Dado o filtro sem o campo termo, o titulo não é considerado na filtragem, e o resultado depende apenas do estado.

## Dúvidas

- Ao comparar o termo com o titulo, a busca deve ignorar diferença entre maiúsculas e minúsculas? Por exemplo, o termo "compra" encontra a tarefa "Compra de leite"?
- Ao comparar o termo com o titulo, a busca deve ignorar acentos? Por exemplo, o termo "acao" encontra a tarefa "Ação do mês"?
- Se o termo for uma string vazia "", a filtragem deve ser ignorada e devolver todas as tarefas do estado, ou nenhuma tarefa deve casar com ele?
- Se o termo tiver espaços no início ou no fim, como " compra ", esses espaços devem ser removidos antes da comparação?
- Se o estado informado for um texto que não está entre "todas", "abertas" e "concluidas", por exemplo "pendentes", a função deve lançar um erro ou devolver uma lista vazia?
