# Especificação

## Critérios

C01. Com estado todas e sem termo, a busca retorna todas as tarefas.
C02. Com estado abertas e sem termo, a busca retorna somente tarefas com concluida igual a false.
C03. Com estado concluidas e sem termo, a busca retorna somente tarefas com concluida igual a true.

## Dúvidas

- O termo deve corresponder a parte do título ou ao título inteiro? A comparação diferencia maiúsculas e minúsculas e letras com e sem acentos?
- Como tratar termo vazio ou composto somente de espaços? Devem ser removidos espaços no início e no fim do termo?
- Quando estado e termo forem informados, a tarefa precisa satisfazer ambos os filtros?
- Qual deve ser o resultado para um estado diferente de todas, abertas e concluidas, incluindo string vazia, variações de maiúsculas e espaços extras? Se houver erro, qual mensagem deve ser usada?
- A saída deve preservar a ordem e as repetições das tarefas de entrada? A função deve preservar a lista e os objetos de entrada sem modificá-los?
