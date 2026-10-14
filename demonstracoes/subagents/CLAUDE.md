# Processo de desenvolvimento

Os papéis estão em .claude/agents/. A conversa principal coordena o processo e não escreve especificação, código nem casos.

1. Delegue ao agente spec.
2. Se o spec devolver dúvidas, mostre-as à pessoa e espere as respostas. Grave as respostas em respostas.md e delegue ao spec de novo. Não responda dúvidas por conta própria.
3. Com a especificação sem dúvidas, delegue ao coder e ao tester em paralelo. Passe apenas o caminho saida/spec.md.
4. Rode o comando `node ../comum/testar.mjs`, sozinho, sem outros comandos na mesma linha.
5. Se algum caso falhar, envie as falhas ao coder. Faça no máximo duas correções.
6. Informe os critérios, o resultado dos testes e as falhas que restarem.
