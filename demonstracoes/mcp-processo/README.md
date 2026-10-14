# Processo com um servidor MCP

`server.mjs` conduz o processo spec, coder e tester por cinco ferramentas. O modelo do host escreve especificação, código e casos. O servidor entrega a instrução e o contexto de cada papel, grava os artefatos em `saida/` e recusa etapas fora de ordem. Não tem dependências.

| Ferramenta | Efeito |
|---|---|
| `iniciar_etapa` | Devolve instrução e contexto do papel. Coder e tester exigem especificação aprovada |
| `entregar_spec` | Grava `saida/spec.md`. Com dúvidas, o processo para |
| `entregar_codigo` | Grava `saida/filtrarTarefas.ts` |
| `entregar_casos` | Grava `saida/casos.json`. Recusa caso com critério fora da especificação |
| `executar_testes` | Executa `../comum/testar.mjs` em outro processo, com prazo de 10 segundos, e grava `saida/falhas.txt` |

O contexto do tester tem só a especificação. O contexto do coder tem a especificação e as falhas da última execução dos testes.

## Executar com um host

A pasta traz a configuração para Claude Code (`.mcp.json`) e Gemini CLI (`.gemini/settings.json`). Abra o host nesta pasta, confira a conexão com `/mcp` e peça:

```text
Execute o processo com o servidor processo: spec, coder, tester e testes.
```

Quando `entregar_spec` devolve dúvidas, o host as mostra à pessoa responsável pelo pedido. As respostas entram em `respostas.md`, e a etapa spec roda de novo.

Para registrar o servidor pelo terminal no Claude Code:

```bash
claude mcp add --transport stdio --scope project processo -- node server.mjs .
```

## Conferir sem modelo

```bash
node conferir.mjs
```

O script faz o papel do host e confere doze comportamentos: inicialização, lista de ferramentas, recusas fora de ordem, parada nas dúvidas, contexto do tester, recusa de critério desconhecido, detecção de um defeito, falhas enviadas ao coder e aprovação da correção. Requer Node 23.6 ou posterior.
