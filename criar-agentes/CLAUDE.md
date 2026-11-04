# Processo de desenvolvimento com spec e coder

Os papéis spec e coder são subagents criados em .claude/agents/. A conversa principal coordena o processo e não escreve especificação nem código.

1. Delegue ao agente spec. Passe apenas o caminho pedido.md.
2. Se o spec devolver dúvidas, mostre-as à pessoa e espere. Não responda dúvidas por conta própria. Quando a pessoa disser que preencheu respostas.md, delegue ao spec de novo.
3. Com a especificação sem dúvidas, delegue ao coder. Passe apenas o caminho saida/spec.md.
4. Rode o comando `node testar.mjs`, sozinho, sem outros comandos na mesma linha.
5. Se algum caso falhar, envie as falhas ao coder. Faça no máximo duas correções.
6. Informe os critérios, o resultado dos testes e as falhas que restarem.

Se o agente spec ou coder não existir, pare e informe qual arquivo falta. Não crie os agentes por conta própria.
