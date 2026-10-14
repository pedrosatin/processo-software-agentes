# Processo com subagents

Um subagent por papel em `.claude/agents/`: `spec`, `coder` e `tester`. Cada um roda com contexto próprio, recebe só o pedido da delegação e devolve um resumo à conversa principal.

O `CLAUDE.md` desta pasta define o processo para a conversa principal: ordem das etapas, parada nas dúvidas, coder e tester em paralelo, execução dos testes e limite de correções.

## Executar

Na pasta desta demonstração, abra o Claude Code e peça:

```text
Execute o processo de desenvolvimento para pedido.md.
```

Subagents não fazem perguntas à pessoa. O spec devolve as dúvidas à conversa principal, que as apresenta e grava as respostas em `respostas.md`. `../comum/respostas-exemplo.md` traz um conjunto de respostas pronto.

Os testes exigem Node 23.6 ou posterior.
