# Especificação

## Critérios

C01. Com estado "todas", retorna todas as tarefas.
C02. Com estado "abertas", retorna apenas as tarefas não concluídas.
C03. Com estado "concluidas", retorna apenas as tarefas concluídas.
C04. Com termo fornecido, filtra as tarefas cujo título corresponde ao termo.

## Dúvidas

1. A busca por termo diferencia maiúsculas de minúsculas? (Ex.: termo "revisar" encontra "Revisar código"?)
2. Acentos diferenciam na busca? (Ex.: termo "relatorio" encontra "Relatório"?)
3. Espaços no começo e no fim do termo devem ser ignorados ou contam na busca? E espaços entre palavras?
4. Como tratar termo vazio ("") ou composto apenas por espaços?
5. O termo pode aparecer em qualquer posição do título ou apenas no início?
6. O que deve acontecer quando o estado for diferente dos aceitos (ex.: "ABERTAS", "pendente")? Lança erro ou retorna lista vazia?
7. Quando estado e termo são passados juntos, a tarefa precisa atender a ambos?
8. A ordem das tarefas na lista recebida deve ser mantida no resultado? A lista original deve permanecer inalterada?
