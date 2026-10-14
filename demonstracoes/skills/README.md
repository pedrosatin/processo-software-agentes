# Processo com Skills

Uma Skill por papel em `.claude/skills/`: `spec`, `coder` e `tester`. A Skill `processo` executa as três em ordem e roda os testes.

| Skill | Lê | Grava | Contexto |
|---|---|---|---|
| `/spec` | `pedido.md`, `respostas.md` | `saida/spec.md` | Conversa principal |
| `/coder` | `saida/spec.md` | `saida/filtrarTarefas.ts` | Separado (`context: fork`) |
| `/tester` | `saida/spec.md` | `saida/casos.json` | Separado (`context: fork`) |

## Executar

Na pasta desta demonstração, abra o Claude Code e digite os comandos em sequência:

```text
/spec
/coder
/tester
! node ../comum/testar.mjs
```

Ou execute tudo com `/processo`.

O spec mostra as dúvidas e para. A pessoa responsável pelo pedido responde na conversa ou edita `respostas.md`. `../comum/respostas-exemplo.md` traz um conjunto de respostas para quem quiser pular essa etapa.

A Skill `processo` usa `disable-model-invocation: true` e só começa quando a pessoa digita o comando. Coder e tester rodam com `context: fork`, em um subagente que não recebe o histórico da conversa. O tester não recebe o código no contexto, e a instrução proíbe a leitura do arquivo.

Os testes exigem Node 23.6 ou posterior, que executa TypeScript sem compilação.
