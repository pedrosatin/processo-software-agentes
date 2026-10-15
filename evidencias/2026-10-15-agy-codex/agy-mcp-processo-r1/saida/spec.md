# Especificação

## Critérios

C01. Com o estado "todas" e nenhum termo, filtrarTarefas devolve todas as tarefas recebidas, na mesma ordem.
C02. Com o estado "abertas" e nenhum termo, filtrarTarefas devolve apenas as tarefas com concluida igual a false.
C03. Com o estado "concluidas" e nenhum termo, filtrarTarefas devolve apenas as tarefas com concluida igual a true.
C04. Com um termo que aparece no título de tarefas, filtrarTarefas devolve apenas as tarefas cujo título contém o termo e que atendem ao estado informado.
C05. Com um termo que não aparece no título de nenhuma tarefa, filtrarTarefas devolve uma lista vazia.
C06. Com uma lista de tarefas vazia, filtrarTarefas devolve uma lista vazia para qualquer estado aceito.
C07. Com o filtro sem a propriedade termo, o título não é considerado na filtragem e o resultado depende apenas do estado.

## Dúvidas

- Ao comparar o termo com o título, a busca deve ignorar a diferença entre maiúsculas e minúsculas (por exemplo, "REVISAR" encontra "Revisar código")?
- Ao comparar o termo com o título, a busca deve ignorar acentos (por exemplo, "relatorio" encontra "Relatório")?
- Se o termo for uma string vazia "" ou contiver apenas espaços, a filtragem deve ignorar o termo e retornar todas as tarefas do estado, ou nenhuma tarefa deve casar?
- Se o termo tiver espaços no início ou no fim (como " comprar "), esses espaços devem ser removidos antes da comparação?
- Se o estado informado for um valor fora de "todas", "abertas" e "concluidas" (como "arquivadas"), a função deve lançar um erro ou devolver uma lista vazia?
