# Especificação

## Critérios

C01. Com estado "todas", retorna todas as tarefas.
C02. Com estado "abertas", retorna só as tarefas não concluídas.
C03. Com estado "concluidas", retorna só as tarefas concluídas.
C04. Estado fora da lista lança o erro "Estado inválido", mesmo com a lista vazia.
C05. O termo pode aparecer em qualquer parte do título. "compr" encontra "Comprar pão".
C06. Maiúsculas e minúsculas não importam. "REVISAR" encontra "Revisar código".
C07. Acentos contam. "relatorio" não encontra "Relatório".
C08. Espaços no começo e no fim do termo são ignorados. "  revisar  " encontra "Revisar código".
C09. Espaços entre palavras contam. "revisar  código", com dois espaços, não encontra "Revisar código".
C10. Termo vazio ou só com espaços não filtra pelo título.
C11. Estado e termo valem juntos. Estado "abertas" com termo "relat" não retorna "Relatório", que está concluída.
C12. O resultado segue a ordem da lista recebida.
C13. A lista recebida não é alterada.

## Dúvidas

Nenhuma.
