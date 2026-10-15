# Respostas às dúvidas

Respostas da pessoa responsável pelo pedido. Cada resposta vale para as próximas execuções do spec.

1. Maiúsculas e minúsculas não importam. Título e termo são convertidos com toLowerCase() do JavaScript, sem locale. "REVISAR" encontra "Revisar código", e "strasse" não encontra "Straße".
2. Acentos contam. "relatorio" não encontra "Relatório".
3. Espaços no começo e no fim do termo são removidos com trim() do JavaScript. Espaços entre palavras contam.
4. Termo vazio, só com espaços ou ausente não filtra pelo título.
5. O termo pode aparecer em qualquer parte do título. "compr" encontra "Comprar pão".
6. O estado é comparado exatamente. "ABERTAS" e " abertas " são inválidos. Estado fora da lista lança Error com a mensagem "Estado inválido", mesmo com a lista vazia.
7. O resultado segue a ordem da lista recebida, e a lista recebida não é alterada.
8. Não há normalização Unicode. Duas codificações do mesmo acento são textos diferentes.
9. Estado e termo valem juntos. A tarefa entra no resultado quando atende aos dois.
10. O resultado traz os próprios objetos da lista recebida, sem cópia.
11. O resultado é sempre um array novo, mesmo quando todas as tarefas entram. Os objetos dentro dele são os da lista recebida.
