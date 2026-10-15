---
name: processo
description: Executa spec, coder e tester em ordem e roda os testes. Use só quando a pessoa pedir pelo nome.
---

1. Execute a Skill spec nesta conversa. Se saida/spec.md tiver dúvidas, mostre-as à pessoa e pare até ela responder.
2. Com a especificação sem dúvidas, inicie um subagente com a mensagem "Execute a Skill coder." e, depois que ele terminar, outro subagente com a mensagem "Execute a Skill tester.". Não passe resumo desta conversa aos subagentes.
3. Rode o comando `node ../comum/testar.mjs`, sozinho, sem outros comandos na mesma linha.
4. Se algum caso falhar, grave as falhas em saida/falhas.txt e inicie de novo o subagente coder com a mesma mensagem. Faça no máximo duas correções.
5. Informe os critérios, o resultado dos testes e as falhas que restarem.
