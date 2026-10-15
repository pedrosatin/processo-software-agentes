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

A pasta traz a configuração para três hosts:

| Host | Arquivo | Conferir a conexão |
|---|---|---|
| Antigravity CLI (`agy`) | `.agents/mcp_config.json` | `/mcp` dentro do `agy` |
| Codex CLI | `.codex/config.toml` | `codex mcp list` no terminal |
| Claude Code | `.mcp.json` | `/mcp` dentro do `claude` |

Abra o host nesta pasta e peça:

```text
Execute o processo com o servidor processo: spec, coder, tester e testes.
```

Quando `entregar_spec` devolve dúvidas, o host as mostra à pessoa responsável pelo pedido. As respostas entram em `respostas.md`, e a etapa spec roda de novo.

O Codex só lê `.codex/config.toml` em pasta confiável. Na primeira vez que abrir `codex` dentro do repositório, aceite confiar na pasta. A linha `default_tools_approval_mode = "approve"` libera as cinco ferramentas do servidor sem pedir confirmação a cada chamada. O servidor roda na sua máquina e só grava em `saida/`.

Para registrar o servidor pelo terminal no Claude Code:

```bash
claude mcp add --transport stdio --scope project processo -- node server.mjs .
```

## Conferir sem modelo

```bash
node conferir.mjs
```

O script faz o papel do host e confere doze comportamentos: inicialização, lista de ferramentas, recusas fora de ordem, parada nas dúvidas, contexto do tester, recusa de critério desconhecido, detecção de um defeito, falhas enviadas ao coder e aprovação da correção. Requer Node 23.6 ou posterior.

## Validar os argumentos

`server.mjs` confere os argumentos contra o subconjunto de JSON Schema usado pelas ferramentas antes de gravar arquivos. O teste de contrato envia entradas inválidas e uma entrada válida pelo transporte real:

```bash
node --test contratos.test.mjs
```

A [conferência de formatos e práticas](../../docs/tutorial/07-padroes-e-limites.md) descreve o subconjunto implementado e suas fontes. O servidor é um exemplo local por `stdio`. Ele não implementa todos os recursos opcionais do MCP nem substitui uma biblioteca de JSON Schema para schemas arbitrários.
