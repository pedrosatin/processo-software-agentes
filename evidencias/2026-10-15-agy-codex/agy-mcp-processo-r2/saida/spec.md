# Especificação

## Critérios

C01. Com estado "todas" e sem termo, retorna todas as tarefas mantendo a ordem original.
C02. Com estado "abertas", retorna apenas as tarefas com concluida igual a false.
C03. Com estado "concluidas", retorna apenas as tarefas com concluida igual a true.
C04. O termo busca no título sem diferenciar maiúsculas e minúsculas via toLowerCase().
C05. Acentos são diferenciados na busca por termo, de forma que "relatorio" não encontra "Relatório".
C06. Espaços no início e no fim do termo são ignorados via trim(), mantendo espaços internos.
C07. Termo vazio, composto apenas por espaços ou ausente não filtra pelo título.
C08. O termo pode aparecer em qualquer parte do título da tarefa.
C09. Quando estado e termo são fornecidos, retorna apenas tarefas que satisfazem ambas as condições.
C10. Estado diferente de "todas", "abertas" ou "concluidas" lança Error com a mensagem "Estado inválido".

## Dúvidas

Nenhuma.
