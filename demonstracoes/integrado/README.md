# Exemplo integrado

## Antigravity e Codex

Retestes completos em 15/10: Antigravity com agentes temporários definidos com MCP habilitado, Codex com seu agente por papel. A configuração inicial de Antigravity falhou ao usar `call_mcp_tool` em `tools` de um agente Markdown e foi substituída. Veja os resultados e os limites de isolamento no relato.

A execução com `agy` e `codex`, os arquivos de configuração, as duas rodadas e a conferência dos resultados estão no [tutorial](../../docs/tutorial/README.md). Use a parte correspondente a esta pasta. Os registros de 15/10 ficam em [evidencias/2026-10-15-agy-codex](../../evidencias/2026-10-15-agy-codex).

## Claude Code

Combina as formas mostradas nas outras pastas:

| Peça | Arquivo | Função |
|---|---|---|
| Subagents | `.claude/agents/` | Um papel por agente, com contexto próprio |
| Skills | `.claude/skills/` | Conhecimento carregado no agente, pelo campo `skills` |
| MCP | `.mcp.json`, `../mcp-processo/server.mjs` | Ordem das etapas, contexto de cada papel e gravação dos artefatos |
| Script de testes | `../comum/testar.mjs` | Verificação executada pelo servidor |
| `CLAUDE.md` | `CLAUDE.md` | Processo seguido pela conversa principal |

Cada subagent só tem as ferramentas do servidor que o papel usa. O tester não tem `Read` e recebe o contexto só por `iniciar_etapa`, que devolve a especificação sem o código.

## Executar

Na pasta desta demonstração, abra o Claude Code, aprove o servidor `processo` e peça:

```text
Execute o processo de desenvolvimento para pedido.md.
```

Para pular as dúvidas, copie `../comum/respostas-exemplo.md` sobre `respostas.md`. A mesma execução roda sem interação com `claude -p "Execute o processo de desenvolvimento para pedido.md."`.

Requer Node 23.6 ou posterior.
