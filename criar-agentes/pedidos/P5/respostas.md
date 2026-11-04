# Respostas às dúvidas do pedido P5

Respostas de quem fez o pedido. Copie para `respostas.md` quando o spec parar com dúvidas.

1. O resultado é um objeto com o nome do responsável como chave e os ids das tarefas como valor.
2. O nome é usado depois de trim(). Maiúsculas contam: "Ana" e "ana" são chaves diferentes.
3. Tarefa sem responsável, ou com responsável vazio depois do trim, vai para a chave "sem responsável".
4. Os ids seguem a ordem da lista recebida.
5. Tarefas concluídas também entram.
6. Lista vazia retorna um objeto vazio, e a lista recebida não é alterada.
