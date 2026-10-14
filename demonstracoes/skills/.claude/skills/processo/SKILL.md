---
name: processo
description: Executa spec, coder e tester em ordem e roda os testes.
disable-model-invocation: true
allowed-tools: Read Write Skill Bash(node ../comum/testar.mjs:*)
---

1. Execute a Skill spec. Se saida/spec.md tiver dúvidas, mostre-as à pessoa e pare até ela responder.
2. Com a especificação sem dúvidas, execute a Skill coder e depois a Skill tester.
3. Rode o comando `node ../comum/testar.mjs`, sozinho, sem outros comandos na mesma linha.
4. Se algum caso falhar, grave as falhas em saida/falhas.txt e execute a Skill coder de novo. Faça no máximo duas correções.
5. Informe os critérios, o resultado dos testes e as falhas que restarem.
