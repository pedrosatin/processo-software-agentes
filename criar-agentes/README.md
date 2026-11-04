# Criar agentes spec e coder

Kit para criar os agentes spec e coder num agente de código (harness) e avaliar o resultado com casos de teste. Os mesmos arquivos funcionam em Antigravity CLI, Codex CLI e Claude Code. A conversa principal segue o processo de `AGENTS.md` ou `CLAUDE.md` e delega cada etapa ao agente do papel.

```text
pedido.md ──> spec ──> saida/spec.md ──> (dúvidas? a pessoa responde em respostas.md)
                                     └─> coder ──> saida/<função>.ts ──> node testar.mjs
```

## Termos desta aula

| Termo | Significado |
|---|---|
| Harness | Programa que roda o modelo e dá a ele ferramentas para ler e gravar arquivos e executar comandos. Aqui são `agy` (Antigravity), `codex` e `claude` (Claude Code) |
| Conversa principal | A sessão em que você escreve no harness. Ela coordena o processo e chama os agentes |
| Agente (subagent) | Um papel definido em arquivo, que roda em uma conversa separada, com contexto próprio, e devolve um resumo |
| Delegar | A conversa principal passa uma etapa ao agente, com um texto curto, e espera o resultado |
| spec | Agente que lê o pedido e escreve os critérios de aceitação (C01, C02...) e as dúvidas |
| coder | Agente que lê a especificação e escreve o código da função |
| `description` | Texto do arquivo do agente que a conversa principal lê para decidir quando chamá-lo |
| Caso de referência | Entrada com o resultado esperado, escrito por quem fez o pedido. Mede o código do coder |

## Requisitos

| Item | Observação |
|---|---|
| Node.js 22.18 ou posterior | Os scripts importam o código TypeScript do coder sem compilação. `node --version` |
| Antigravity CLI | Sem custo, com conta Google, com cota semanal. Instalação em [antigravity.google/docs/cli](https://antigravity.google/docs/cli/). `agy --version` e login na primeira execução |
| Codex CLI | Opcional. `npm install -g @openai/codex` e login com a conta do ChatGPT. Depende do plano da conta |
| Claude Code | Opcional. Exige plano pago ou crédito de API |

Sem Node na máquina, troque `node` por `docker run --rm -it -v "${PWD}:/w" -w /w node:24-alpine node` nos comandos abaixo (no PowerShell; no Linux e no macOS use `"$PWD"`).

## Obter o kit

```bash
git clone https://github.com/pedrosatin/processo-software-agentes.git
cd processo-software-agentes/criar-agentes
```

Quem já tem o repositório usa `git pull`. Todos os comandos deste README rodam dentro da pasta `criar-agentes`, e os arquivos dos agentes também ficam dentro dela.

## Onde fica cada agente

Um agente é um arquivo com nome, descrição, ferramentas e instruções. O harness lê a pasta do projeto ao iniciar a sessão. Uma sessão aberta antes de criar o arquivo não enxerga o agente novo.

| Harness | Arquivo do agente, dentro de `criar-agentes/` | Regras da conversa principal | Pasta pessoal, vale para todos os projetos |
|---|---|---|---|
| Antigravity | `.agents/agents/spec.md` e `coder.md` | `AGENTS.md` | `~/.gemini/config/agents/` |
| Codex | `.codex/agents/spec.toml` e `coder.toml` | `AGENTS.md` | `~/.codex/agents/` |
| Claude Code | `.claude/agents/spec.md` e `coder.md` | `CLAUDE.md` | `~/.claude/agents/` |

O harness identifica o agente pelo campo `name`, e não pelo nome do arquivo. Por isso o `name` precisa ser `spec` e `coder`.

## Declarar um agente em cada harness

### Claude Code

Arquivo Markdown com cabeçalho YAML. O corpo é o prompt do agente.

```markdown
---
name: spec
description: Escreve a especificação com critérios e dúvidas. Use antes de qualquer implementação.
tools: Read, Write
---

Leia pedido.md e respostas.md. Grave saida/spec.md com as seções Critérios (C01, C02...) e Dúvidas.
Use as respostas nos critérios e copie as mensagens de erro exatamente. Sem dúvidas, escreva Nenhuma.
Não escolha respostas nem escreva código.
```

| Campo | Obrigatório | Função |
|---|---|---|
| `name`, `description` | Sim | Identificador e texto de decisão da delegação |
| `tools`, `disallowedTools` | Não | Lista permitida e lista proibida de ferramentas. Sem `tools`, o agente herda todas |
| `model` | Não | `sonnet`, `opus`, `haiku`, `fable`, um ID completo ou `inherit` |
| `permissionMode` | Não | `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | Não | Limite de turnos do agente |
| `skills`, `mcpServers`, `hooks` | Não | Skills carregadas na partida, servidores MCP e hooks do agente |
| `memory`, `background`, `isolation`, `effort`, `color` | Não | Memória persistente, execução em segundo plano, worktree temporário, esforço de raciocínio e cor |

Nomes das ferramentas: `Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep`. `Write` cria ou sobrescreve um arquivo. Para alterar um trecho, use `Edit`. Um arquivo sem `name` ou sem `description` é ignorado sem aviso; `claude --debug` mostra o motivo.

Documentação: [subagents](https://code.claude.com/docs/en/sub-agents), [ferramentas](https://code.claude.com/docs/en/tools-reference), [CLAUDE.md e AGENTS.md](https://code.claude.com/docs/en/memory).

### Antigravity

Mesmo formato Markdown com YAML. As ferramentas são uma lista, com nomes do Antigravity.

```markdown
---
name: spec
description: Escreve a especificação com critérios e dúvidas. Use antes de qualquer implementação.
tools:
  - view_file
  - write_to_file
subagent: true
mainAgent: false
---

Mesmas instruções do Claude Code, abaixo do cabeçalho.
```

| Campo | Obrigatório | Função |
|---|---|---|
| `name`, `description` | Sim | Identificador e texto que o planejador lê para decidir a delegação |
| `tools` | Não | Lista de ferramentas permitidas. Declare sempre, porque as páginas oficiais divergem sobre o padrão |
| `subagent`, `mainAgent` | Não | Se pode ser chamado como subagent e se pode ser escolhido como agente principal (`agy --agent <nome>`) |
| `model` | Não | `inherit`, `flash` ou `pro` |
| `commandExecutionPolicy` | Não | `off`, `auto`, `eager` ou `sandbox`, para comandos de shell |
| `mcpServers`, `skills`, `plugins` | Não | Servidores MCP, Skills e plugins do agente |

Nomes das ferramentas: `view_file` (ler), `write_to_file` (criar arquivo), `replace_file_content` (alterar um trecho), `grep_search`, `find_by_name`, `run_command`. O nome `write_to_file` não aparece nas páginas de documentação consultadas, mas está na lista de ferramentas que o `agy` 1.4.12 informa ao iniciar, e os agentes deste kit funcionaram com ele em 04/11. A documentação avisa que um nome de ferramenta errado pode travar o agente.

Documentação: [subagents](https://antigravity.google/docs/subagents/), [comando /agents](https://antigravity.google/docs/cli/commands/agents/), [modo headless](https://antigravity.google/docs/cli/headless/), [planos e cota](https://antigravity.google/docs/plans/).

### Codex

Arquivo TOML. As instruções ficam em `developer_instructions`.

```toml
name = "spec"
description = "Escreve a especificação com critérios e dúvidas. Use antes de qualquer implementação."
developer_instructions = """
Leia pedido.md e respostas.md. Grave saida/spec.md com as seções
Critérios (C01, C02...) e Dúvidas. Use as respostas nos critérios
e copie as mensagens de erro exatamente. Sem dúvidas, escreva Nenhuma.
Não escolha respostas nem escreva código.
"""
```

| Campo | Obrigatório | Função |
|---|---|---|
| `name`, `description`, `developer_instructions` | Sim | Identificador, texto de decisão da delegação e instruções do papel |
| `model`, `model_reasoning_effort` | Não | Modelo e esforço de raciocínio do agente |
| `features.shell_tool = false` e outros `features.*` | Não | Desligam capacidades, como o shell |
| `skills.config` | Não | Desliga Skills específicas |

O Codex não tem lista de ferramentas por nome. O arquivo do agente também não muda `sandbox_mode`, `approval_policy` nem `mcp_servers`: o agente herda a sandbox e as aprovações da sessão. Pedir "só leia" nas instruções não cria uma sandbox somente leitura. O Codex só chama um agente quando você pede ou quando o `AGENTS.md` manda delegar, e só lê `.codex/` depois que você aceita confiar na pasta.

Documentação: [subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents), [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [comandos](https://learn.chatgpt.com/docs/cli/slash-commands).

### O coder completo, para o pedido de exemplo

O coder lê `saida/spec.md` e `pedido.md`. A assinatura da função está em `pedido.md`. As mensagens de erro e as demais decisões estão nas respostas e chegam ao coder pela especificação, por isso o spec copia as mensagens exatamente e o coder as repete sem mudar.

```markdown
---
name: coder
description: Implementa percentualConcluido a partir de saida/spec.md sem dúvidas em aberto.
tools: Read, Write
---

Leia saida/spec.md e pedido.md. Grave saida/percentualConcluido.ts exportando a função
percentualConcluido e o tipo Tarefa. Funções puras, sem classes, sem imports, sem ponto e vírgula
e sem alterar a entrada. Mensagens de erro exatamente como na especificação.
Quando receber falhas de testes, corrija o comportamento de cada uma.
```

No Antigravity, o cabeçalho leva `tools` com `view_file`, `write_to_file` e `replace_file_content`, e as instruções são as mesmas:

```markdown
---
name: coder
description: Implementa percentualConcluido a partir de saida/spec.md sem dúvidas em aberto.
tools:
  - view_file
  - write_to_file
  - replace_file_content
subagent: true
mainAgent: false
---

Leia saida/spec.md e pedido.md. Grave saida/percentualConcluido.ts (instruções do coder acima).
```

No Codex, as instruções vão em `developer_instructions`:

```toml
name = "coder"
description = "Implementa percentualConcluido a partir de saida/spec.md sem dúvidas em aberto."
developer_instructions = """
Leia saida/spec.md e pedido.md. Grave saida/percentualConcluido.ts exportando a função
percentualConcluido e o tipo Tarefa. Funções puras, sem classes, sem imports, sem ponto e
vírgula e sem alterar a entrada. Mensagens de erro exatamente como na especificação.
Quando receber falhas de testes, corrija o comportamento de cada uma.
"""
```

Na atividade, troque o nome da função e do arquivo pelos do seu pedido.

## Passo a passo

1. Escolha o pedido. Na aula, use o exemplo. Na atividade, use o seu RA.

   ```bash
   node pedido.mjs exemplo
   node pedido.mjs 12345678-9
   ```

   Rodar `pedido.mjs` de novo apaga `respostas.md`. As respostas anteriores ficam em `respostas.anterior.md`. Os arquivos ocultos `.pedido` e `.ra` guardam a sua escolha, e você não precisa editá-los.

2. Crie os arquivos dos agentes spec e coder na pasta do seu harness, dentro de `criar-agentes/`. O coder grava o arquivo indicado no fim de `pedido.md`.
3. Abra o harness nesta pasta (`agy`, `codex` ou `claude`). Aceite as permissões que ele pedir para ler e gravar arquivos nesta pasta e para rodar `node testar.mjs`. Peça:

   ```text
   Execute o processo de desenvolvimento para pedido.md.
   ```

4. O spec para com dúvidas. Elas aparecem na resposta da conversa principal e na seção Dúvidas de `saida/spec.md`. As respostas de quem fez o pedido estão em `pedidos/<pedido>/respostas.md`. Copie para `respostas.md`. Se o spec levantar uma dúvida que essas respostas não cobrem, escreva a sua decisão em `respostas.md`. Se o spec disser que não tem dúvidas, escreva em `respostas.md` que usou as respostas do pedido, com mais de 40 caracteres. Depois peça:

   ```text
   Preenchi respostas.md. Execute o processo de desenvolvimento para pedido.md.
   ```

5. Confira que o harness delegou ao spec e ao coder, e não escreveu o código na conversa principal (próxima seção). A conversa principal roda os casos de referência. Você também pode rodar:

   ```bash
   node testar.mjs
   ```

6. Na atividade, gere a evidência:

   ```bash
   node evidencia.mjs
   ```

   Cada conferência com `[falhou]` traz uma linha "O que fazer". A saída do comando é 1 quando alguma conferência falha. O arquivo é gravado mesmo assim, mas corrija antes de enviar.

## Como saber que o agente foi executado

A mensagem final do modelo não comprova a delegação nem a aprovação. Confira em três lugares.

| Onde | O que procurar |
|---|---|
| Na tela do harness | Claude Code: uma linha de chamada com o nome do agente, como `spec(...)`, e `/tasks` para listar os agentes em execução e os recentes. Antigravity: a chamada `invoke_subagent` e o comando `/agents`, que lista os agentes com estado. Codex: o comando `/subagents`, que troca entre as conversas dos agentes |
| Nos arquivos | `saida/spec.md` e `saida/<função>.ts` foram gravados. Quem escreveu foi o agente se o harness mostra a gravação dentro da delegação, e não na conversa principal |
| Na saída dos agentes dos exemplos | Os agentes de `exemplos/` gravam uma marca no arquivo (`"agente": "validador"` ou um comentário `<!-- agente: documentador -->`), e o `avaliar.mjs` avisa quando ela falta. A marca é um texto que qualquer um pode escrever. Ela ajuda a notar um arquivo escrito pela conversa principal, mas não prova a delegação |

No `/agents` do Claude Code atual, o comando só imprime um lembrete e não lista os agentes. Em modo não interativo, `claude -p --output-format stream-json --verbose` marca as mensagens dos agentes com `parent_tool_use_id`. O `agy -p --output-format stream-json` registra a atividade do agente em eventos `step_update` com `subagent_info`. O `codex exec --json` registra eventos `collab_tool_call` quando delega, mas no ensaio de 04/11 só o evento `wait` apareceu, e a criação do agente não. Para o Codex, confira a delegação na tela ou com `/subagents`.

Mesmo com a delegação visível, a conversa principal pode chamar outros agentes além dos seus. Num ensaio de 04/11, o Claude Code chamou também os agentes `Explore` e `general-purpose` só para listar arquivos. Confira o nome do tipo de cada chamada.

## Como saber se o resultado é bom

Os casos de referência medem o código do coder. A taxa de acerto é a quantidade de casos aprovados dividida pela quantidade de casos executados.

- O spec escreve critérios, e os casos de referência são poucos. Um critério sem caso de referência não é medido e não entra na taxa. Uma taxa de 100% com 6 casos para 14 critérios mede só parte do que o spec prometeu.
- Leia `saida/spec.md` e compare cada critério com `respostas.md`. Um critério que contradiz uma resposta é um erro do spec, mesmo com a taxa em 100%.
- Leia o código gerado. O teste confere o comportamento e não confere o estilo. As regras de funções puras, sem classes e sem ponto e vírgula dependem da sua leitura.
- Em agentes que classificam ou listam achados, use também falsos positivos e falsos negativos, como em `exemplos/`.

## Exemplos além do spec e do coder

A pasta [`exemplos/`](exemplos) traz dois agentes de outro tipo, com métricas de acerto, falsos positivos e falsos negativos, e com a marca da execução. Leia o [README dos exemplos](exemplos/README.md).

| Pasta | Agente | O que avalia |
|---|---|---|
| `exemplos/validacao` | `validador` | Regras do projeto em 7 arquivos TypeScript, com defeitos plantados, um caso correto e uma armadilha |
| `exemplos/documentacao` | `documentador` | Parâmetros e mensagens de erro de 4 funções, comparados com o código |

## Arquivos

| Arquivo | Função |
|---|---|
| `pedido.mjs` | Escolhe o pedido pelo RA, ou o exemplo, e prepara `pedido.md` e `respostas.md` |
| `pedidos/<id>/` | Pedido, respostas de quem pediu e casos de referência |
| `testar.mjs` | Executa os casos de referência contra `saida/<função>.ts` |
| `evidencia.mjs` | Confere os agentes e a saída, executa os casos e grava `entrega/evidencia-<RA>.json` |
| `AGENTS.md`, `CLAUDE.md` | Processo seguido pela conversa principal |
| `exemplos/` | Agentes de validação e documentação, com avaliação de acerto |

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| A conversa principal diz que o agente spec não existe | Arquivo fora da pasta do harness dentro de `criar-agentes/`, `name` diferente de `spec`, ou sessão aberta antes de criar o arquivo. Feche e abra o harness de novo |
| `evidencia.mjs` diz `[falhou] agente spec definido` | A mensagem seguinte lista as pastas procuradas e os agentes encontrados |
| O Codex ignora `.codex/agents/` | O repositório ainda não foi marcado como confiável. Abra `codex` na pasta e aceite a confiança |
| O Codex não chama o agente | O Codex só delega quando você pede ou quando o `AGENTS.md` manda. Confira se o arquivo está na pasta |
| A conversa principal escreve o código sozinha | A descrição do agente não diz quando usá-lo, ou as regras de `AGENTS.md` foram apagadas |
| O harness para pedindo permissão | O agente precisa gravar em `saida/` e a conversa principal precisa rodar `node testar.mjs`. Aprove ou libere esses comandos na pasta |
| O coder grava outro arquivo | As instruções do coder citam a função do exemplo. Troque pelo nome que está em `pedido.md` |
| O código tem a assinatura ou a mensagem de erro errada | A assinatura está em `pedido.md`, e as mensagens de erro estão nas respostas. Confira se o coder lê `pedido.md` e se o spec copiou as mensagens de erro exatamente nos critérios |
| `testar.mjs` acusa erro de sintaxe | Node anterior a 22.18. Use o comando com Docker |

## Referências

- Claude Code: [subagents](https://code.claude.com/docs/en/sub-agents), [ferramentas](https://code.claude.com/docs/en/tools-reference), [modo não interativo](https://code.claude.com/docs/en/headless).
- Codex: [subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents), [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [modo não interativo](https://learn.chatgpt.com/docs/non-interactive-mode).
- Antigravity: [subagents](https://antigravity.google/docs/subagents/), [comando /agents](https://antigravity.google/docs/cli/commands/agents/), [modo headless](https://antigravity.google/docs/cli/headless/), [planos](https://antigravity.google/docs/plans/).
- Formato de regras compartilhado: [agents.md](https://agents.md).
