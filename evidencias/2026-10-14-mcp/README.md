# Experimento com o servidor MCP em 14/10/2026

## Pergunta

Quando a ordem do processo fica num servidor MCP, o host segue as etapas que o servidor libera e para quando a especificação tem dúvidas?

## Montagem

| Item | Valor |
|---|---|
| Host | Claude Code em modo não interativo (`claude -p`) |
| Modelo | Haiku (`claude-haiku-5-5`) |
| Servidor | [demonstracoes/mcp-processo/server.mjs](../../demonstracoes/mcp-processo/server.mjs), por stdio |
| Ferramentas liberadas | Somente as cinco do servidor: `iniciar_etapa`, `entregar_spec`, `entregar_codigo`, `entregar_casos`, `executar_testes`. As ferramentas internas do Claude Code foram desligadas com `--tools ''` |
| Prompt | `Execute o processo com o servidor processo: etapa spec, depois coder e tester, depois executar_testes. Se houver falhas, faça até duas correções pelo coder. Se a spec tiver dúvidas, pare e liste as dúvidas.` |

| Rodada | `respostas.md` |
|---|---|
| 1 | Só o cabeçalho |
| 2 | Cópia de [respostas-exemplo.md](../../demonstracoes/comum/respostas-exemplo.md) |

O servidor guarda o estado em `saida/`. `iniciar_etapa` devolve a instrução e o contexto de cada papel e recusa `coder` e `tester` enquanto a especificação tiver dúvidas. O tester recebe só a especificação. O coder recebe a especificação e as falhas da execução anterior.

## Fluxo observado

```text
Rodada 1                                   Rodada 2
Host                    Servidor           Host                    Servidor
 │                         │                │                         │
 ├─ iniciar_etapa spec ───►│                ├─ iniciar_etapa spec ───►│
 │◄─ instrução, pedido,    │                ├─ entregar_spec ────────►│ aprovado
 │   respostas (vazio)     │                ├─ iniciar_etapa coder ──►│
 ├─ entregar_spec ────────►│                ├─ entregar_codigo ──────►│
 │◄─ parado, 5 dúvidas     │                ├─ iniciar_etapa tester ─►│
 └─ lista as dúvidas                        ├─ entregar_casos ───────►│
                                            ├─ executar_testes ──────►│
                                            │◄─ aprovado, 23 de 23    │
```

## Resultados

| Medida | Rodada 1 | Rodada 2 |
|---|---|---|
| Chamadas ao servidor | 2 | 7 |
| Critérios | 7 | 20 |
| Dúvidas | 5 | 0 |
| `executar_testes` | | 23 de 23 |
| Casos do tester contra a implementação de referência | | 23 de 23 |
| Suíte de referência contra o código entregue | | 14 de 14 |
| Duração | 12 s | 33 s |

As cinco dúvidas da rodada 1 ([rodada-1/spec.md](rodada-1/spec.md)) tratam de maiúsculas, acentos, termo vazio, espaços nas bordas e estado desconhecido.

## Interpretação

O servidor fez valer a ordem: na rodada 1 a especificação com dúvidas voltou com `estado: parado`, e o host listou as dúvidas sem pedir `coder`. Na rodada 2 o host seguiu a sequência que o servidor liberou.

Nesta demonstração os três papéis rodam na mesma conversa, com o mesmo modelo. O servidor controla o que cada etapa recebe, e o modelo ainda tem na memória o código que escreveu como coder quando chega à etapa tester. Para separar os contextos, o [experimento integrado](../2026-10-14-integrado) coloca cada papel num subagent que chama o mesmo servidor.

## Limitações

- Uma execução por rodada, com um modelo e um host. O host Gemini CLI não foi testado nesta data.
- O tester escreveu casos na mesma conversa em que o código foi escrito.
- No relato final o modelo diz que os casos, por compararem só ids, não verificam C18 (lista recebida sem alteração) nem C19 (mesmas referências). A primeira parte está errada: o `testar.mjs` confere a lista recebida em todos os casos. A segunda está certa: o formato dos casos não verifica identidade de objetos.
- O coder recebe do servidor a especificação, sem a assinatura do pedido. Nesta execução ele acertou a assinatura. No [experimento integrado](../2026-10-14-integrado) o coder errou a assinatura pelo mesmo motivo.

## Como reproduzir

Na pasta [demonstracoes/mcp-processo](../../demonstracoes/mcp-processo):

```bash
claude -p "<prompt da tabela acima>" --model haiku --permission-mode dontAsk \
  --strict-mcp-config --mcp-config .mcp.json --tools '' \
  --allowedTools "mcp__processo__iniciar_etapa,mcp__processo__entregar_spec,mcp__processo__entregar_codigo,mcp__processo__entregar_casos,mcp__processo__executar_testes"
```

Para ver o servidor sem modelo, rode `node demonstracoes/mcp-processo/conferir.mjs` na raiz do repositório.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `rodada-*/transcricao.md` | Chamadas ao servidor e respostas dele |
| `rodada-*/spec.json`, `spec.md` | Especificação entregue ao servidor e a versão em Markdown gravada por ele |
| `rodada-2/filtrarTarefas.ts`, `casos.json` | Código e casos entregues |
| `rodada-2/testes.txt` | Saída de `node ../comum/testar.mjs` sobre os arquivos entregues |
