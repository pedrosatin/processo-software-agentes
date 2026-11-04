# Respostas às dúvidas do pedido E

Respostas de quem fez o pedido. Copie para `respostas.md` quando o spec parar com dúvidas.

1. O resultado vai de 0 a 100, e não de 0 a 1.
2. O valor é Math.round(concluidas * 100 / total), nessa ordem de operações. Uma de três tarefas concluídas dá 33, e 29 de 200 dá 15.
3. Lista vazia retorna 0.
4. Cada item da lista conta uma vez, mesmo que dois itens tenham o mesmo id.
5. A lista recebida não é alterada.
