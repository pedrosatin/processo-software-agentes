# Respostas às dúvidas do pedido P7

Respostas de quem fez o pedido. Copie para `respostas.md` quando o spec parar com dúvidas.

1. Entram as tarefas com prazo entre hoje e hoje mais o número de dias, incluindo as duas pontas.
2. Prazos anteriores a hoje não entram.
3. Tarefas concluídas e tarefas sem prazo não entram.
4. O resultado vem do prazo mais próximo para o mais distante. Prazos iguais mantêm a ordem da lista recebida.
5. Dias precisa ser um número inteiro maior ou igual a 0. Fora disso, lança Error com a mensagem "Dias inválidos". Com 0, entram só as tarefas com prazo hoje.
6. A contagem de dias segue o calendário, inclusive na virada de mês. O resultado traz os próprios objetos recebidos, e a lista recebida não é alterada.
