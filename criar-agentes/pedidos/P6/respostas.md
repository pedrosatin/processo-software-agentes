# Respostas às dúvidas do pedido P6

Respostas de quem fez o pedido. Copie para `respostas.md` quando o spec parar com dúvidas.

1. Maiúsculas e minúsculas não importam. A busca e as tags são comparadas depois de toLowerCase().
2. Espaços no começo e no fim da busca são removidos com trim(). Um "#" no começo da busca é ignorado.
3. A tag precisa ser igual, inteira. "back" não encontra "backend".
4. Busca vazia depois do trim e da remoção do "#" lança Error com a mensagem "Tag inválida".
5. O resultado segue a ordem da lista recebida e traz os próprios objetos recebidos.
6. A lista recebida não é alterada.
