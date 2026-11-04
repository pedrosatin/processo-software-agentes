# Respostas às dúvidas do pedido P4

Respostas de quem fez o pedido. Copie para `respostas.md` quando o spec parar com dúvidas.

1. Espaços no começo e no fim são removidos com trim() antes de qualquer verificação.
2. Título vazio depois do trim retorna { ok: false, erro: "Título obrigatório" }.
3. Menos de 3 caracteres depois do trim retorna { ok: false, erro: "Título curto" }.
4. Mais de 80 caracteres depois do trim retorna { ok: false, erro: "Título longo" }.
5. Os caracteres são contados pelo length do JavaScript.
6. Título válido retorna { ok: true }, sem o campo erro.
