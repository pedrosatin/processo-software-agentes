# Criar agentes spec e coder

Kit para criar os agentes spec e coder num agente de código (harness) e avaliar o resultado com casos de teste. Os mesmos arquivos funcionam em Antigravity CLI, Codex CLI e Claude Code. A conversa principal segue o processo de `AGENTS.md` ou `CLAUDE.md` e delega cada etapa ao agente do papel.

```text
pedido.md ──> spec ──> saida/spec.md ──> (dúvidas? a pessoa responde em respostas.md)
                                     └─> coder ──> saida/<função>.ts ──> node testar.mjs
```

## Requisitos

| Item | Observação |
|---|---|
| Node.js 22.18 ou posterior | Os scripts importam o código TypeScript do coder sem compilação. `node --version` |
| Antigravity CLI | Sem custo, com conta Google. Instalação em [antigravity.google/docs/cli](https://antigravity.google/docs/cli/). `agy --version` |
| Codex CLI | Opcional. `npm install -g @openai/codex` e login com a conta do ChatGPT. Depende do plano da conta |
| Claude Code | Opcional. Exige plano pago ou crédito de API |

Sem Node na máquina, troque `node` por `docker run --rm -it -v "${PWD}:/w" -w /w node:24-alpine node` nos comandos abaixo.

## Onde fica cada agente

Um agente é um arquivo com nome, descrição, ferramentas e instruções. O harness lê a pasta do projeto ao iniciar a sessão.

| Harness | Arquivo do agente | Regras da conversa principal |
|---|---|---|
| Antigravity | `.agents/agents/spec.md` e `coder.md` | `AGENTS.md` |
| Codex | `.codex/agents/spec.toml` e `coder.toml` | `AGENTS.md` |
| Claude Code | `.claude/agents/spec.md` e `coder.md` | `CLAUDE.md` |

Formato no Antigravity e no Claude Code, com cabeçalho YAML:

```markdown
---
name: spec
description: Escreve a especificação do pedido com critérios numerados e dúvidas em aberto. Use antes de qualquer implementação.
tools: Read, Write
---

Leia pedido.md e respostas.md. Grave saida/spec.md com as seções Critérios e Dúvidas.
```

No Antigravity, `tools` é uma lista (`view_file`, `write_to_file`, `replace_file_content`) e o cabeçalho leva também `subagent: true` e `mainAgent: false`. No Codex, o mesmo conteúdo vai em TOML, com as instruções em `developer_instructions`:

```toml
name = "spec"
description = "Escreve a especificação do pedido com critérios numerados e dúvidas em aberto."
developer_instructions = """
Leia pedido.md e respostas.md. Grave saida/spec.md com as seções Critérios e Dúvidas.
"""
```

A `description` é o que a conversa principal lê para decidir a delegação. As instruções só chegam ao agente depois que ele é chamado.

## Passo a passo

1. Escolha o pedido. Na aula, use o exemplo. Na atividade, use o seu RA.

   ```bash
   node pedido.mjs exemplo
   node pedido.mjs 12345678-9
   ```

2. Crie os arquivos dos agentes spec e coder na pasta do seu harness. O coder grava o arquivo indicado no fim de `pedido.md`.
3. Abra o harness nesta pasta (`agy`, `codex` ou `claude`) e peça:

   ```text
   Execute o processo de desenvolvimento para pedido.md.
   ```

4. O spec para com dúvidas. As respostas de quem fez o pedido estão em `pedidos/<pedido>/respostas.md`. Copie para `respostas.md`. Se o spec levantar uma dúvida que essas respostas não cobrem, escreva a sua decisão em `respostas.md`. Depois peça:

   ```text
   Preenchi respostas.md. Execute o processo de desenvolvimento para pedido.md.
   ```

5. Confira que o harness delegou ao spec e ao coder, e não escreveu o código na conversa principal. Rode os casos de referência:

   ```bash
   node testar.mjs
   ```

6. Na atividade, gere a evidência:

   ```bash
   node evidencia.mjs
   ```

## Arquivos

| Arquivo | Função |
|---|---|
| `pedido.mjs` | Escolhe o pedido pelo RA, ou o exemplo, e prepara `pedido.md` e `respostas.md` |
| `pedidos/<id>/` | Pedido, respostas de quem pediu e casos de referência |
| `testar.mjs` | Executa os casos de referência contra `saida/<função>.ts` |
| `evidencia.mjs` | Confere os agentes e a saída, executa os casos e grava `entrega/evidencia-<RA>.json` |
| `AGENTS.md`, `CLAUDE.md` | Processo seguido pela conversa principal |

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| A conversa principal diz que o agente spec não existe | Arquivo fora da pasta do harness, nome diferente de `spec`, ou sessão aberta antes de criar o arquivo. Feche e abra o harness de novo |
| O Codex ignora `.codex/agents/` | O repositório ainda não foi marcado como confiável. Abra `codex` na pasta e aceite a confiança |
| A conversa principal escreve o código sozinha | A descrição do agente não diz quando usá-lo, ou as regras de `AGENTS.md` foram apagadas |
| O coder grava outro arquivo | As instruções do coder citam a função do exemplo. Troque pelo nome que está em `pedido.md` |
| `testar.mjs` acusa erro de sintaxe | Node anterior a 22.18. Use o comando com Docker |
