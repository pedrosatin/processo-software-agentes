# Experimento integrado em 14/10/2026

## Pergunta

Combinando os três mecanismos, com subagents para separar os contextos, o servidor MCP para controlar a ordem e o `CLAUDE.md` para coordenar, o processo completa o ciclo de dúvida, implementação, teste e correção?

## Montagem

| Item | Valor |
|---|---|
| Ferramenta | Claude Code em modo não interativo (`claude -p`) |
| Modelo | Haiku (`claude-haiku-5-5`), na conversa principal e nos subagents |
| Instruções | [demonstracoes/integrado](../../demonstracoes/integrado): `CLAUDE.md` e um subagent por papel em `.claude/agents/`, cada um com acesso só às ferramentas do servidor |
| Servidor | [demonstracoes/mcp-processo/server.mjs](../../demonstracoes/mcp-processo/server.mjs) |
| Prompt | `Execute o processo de desenvolvimento para pedido.md.` |
| Ferramentas liberadas | `Read`, `Write`, `Agent` e as cinco ferramentas do servidor |

| Rodada | `respostas.md` |
|---|---|
| 1 | Só o cabeçalho |
| 2 | Dez respostas de [respostas-exemplo.md](../../demonstracoes/comum/respostas-exemplo.md) |
| 3 | Onze respostas, com a resposta 11 sobre o array devolvido |

## Rodada 1. Sete dúvidas

O subagent spec chamou `iniciar_etapa spec`, recebeu `respostas.md` vazio e não entregou a especificação. Devolveu sete dúvidas à conversa principal, que as mostrou com uma sugestão de resposta para cada uma e parou. Nenhum arquivo de especificação foi gravado. Duração de 14 s.

## Rodada 2. Uma dúvida restante

```text
Conversa principal        subagent spec                 Servidor
 │                          │                              │
 ├─ Agent spec ────────────►├─ iniciar_etapa spec ────────►│
 │                          │◄─ pedido e 10 respostas      │
 │                          ├─ entregar_spec ─────────────►│
 │                          │◄─ parado, 1 dúvida           │
 │◄─ 25 critérios, 1 dúvida │                              │
 └─ mostra a dúvida e para
```

A dúvida ([rodada-2/spec.md](rodada-2/spec.md)): com estado `todas` e sem termo, o resultado é um array novo ou o próprio array recebido? As respostas diziam que os objetos não são copiados e que a lista recebida não muda, sem dizer nada sobre o array devolvido. O spec tentou ler arquivos com `Read` e recebeu `No such tool available: Read`, porque a lista `tools` da definição do subagent só inclui as ferramentas do servidor.

## Rodada 3. Processo completo com correção

```text
Conversa principal      spec        coder              tester         Servidor
 │                       │            │                  │               │
 ├─ Agent spec ─────────►│ entregar_spec ───────────────────────────────►│ aprovado
 ├─ Agent coder ─────────────────────►│ entregar_codigo ────────────────►│
 ├─ Agent tester ────────────────────────────────────────►│ entregar_casos ►│
 ├─ executar_testes ────────────────────────────────────────────────────►│
 │◄─ reprovado, 27 de 31 casos falharam: erro inesperado "Estado inválido"
 ├─ Agent coder (correção) ──────────►│ entregar_codigo ────────────────►│
 ├─ executar_testes ────────────────────────────────────────────────────►│
 │◄─ aprovado, 31 de 31
```

Na primeira entrega o coder escreveu `filtrarTarefas(estado, tarefas, termo)`, com os parâmetros em outra ordem e sem o objeto `filtro`. Os casos chamavam `filtrarTarefas(tarefas, { estado, termo })`, e a função recebia a lista no lugar do estado. A conversa principal leu as falhas, delegou a correção ao coder com a assinatura do pedido, e a segunda entrega passou.

```diff
-export function filtrarTarefas<T extends Tarefa>(
-  estado: string,
-  tarefas: T[],
-  termo?: string | null
-): T[] {
+export function filtrarTarefas(tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[] {
+  const estado = filtro.estado
```

## Resultados

| Medida | Rodada 1 | Rodada 2 | Rodada 3 |
|---|---|---|---|
| Etapas executadas | spec | spec | spec, coder e tester, testes, correção, testes |
| Critérios | | 25 | 22 |
| Dúvidas | 7 | 1 | 0 |
| Primeira execução dos testes | | | 4 de 31 |
| Execução após a correção | | | 31 de 31 |
| Casos do tester contra a implementação de referência | | | 31 de 31 |
| Suíte de referência contra o código final | | | 14 de 14 |
| Duração | 14 s | 10 s | 68 s |

## Interpretação

O ciclo completo apareceu nas três rodadas: dúvidas sem resposta pararam o processo, uma resposta ausente gerou uma dúvida nova, e uma falha de teste voltou ao coder e foi corrigida dentro do limite de duas correções.

A falha da rodada 3 tem causa no servidor. `iniciar_etapa coder` entrega ao coder a especificação e as falhas, e a especificação gerada tem só `criterios` e `duvidas`, sem a assinatura do pedido. O coder do subagent não tem `Read` e não consegue abrir `pedido.md`. A verificação com os casos do tester pegou o erro, e a correção dependeu de a conversa principal repassar a assinatura.

## Limitações

- Uma execução por rodada, com um modelo.
- A primeira tentativa da rodada 3 usou uma cópia de trabalho com as dez respostas antigas e repetiu a dúvida da rodada 2. A execução desta pasta foi refeita com as onze respostas.
- Só o código final do coder foi gravado em `filtrarTarefas.ts`. A primeira versão está na transcrição da rodada 3.
- A conversa principal rodou comandos Bash de leitura (`ls -la && cat pedido.md`, `sleep 5`) com sucesso, embora Bash não estivesse na lista de ferramentas liberadas. Nenhum desses comandos alterou arquivos.
- O tester relata que os casos, por guardarem só ids, não verificam C19 a C21 (array novo, mesmas referências, lista recebida sem alteração). A não alteração da lista é conferida pelo `testar.mjs` em todos os casos. Array novo e identidade de objetos ficam sem verificação no formato atual dos casos.
- A conversa principal fala em dezessete falhas na primeira execução. O resultado do servidor mostra 27.

## Como reproduzir

Na pasta [demonstracoes/integrado](../../demonstracoes/integrado):

```bash
claude -p "Execute o processo de desenvolvimento para pedido.md." --model haiku --permission-mode dontAsk \
  --strict-mcp-config --mcp-config .mcp.json \
  --allowedTools "Read,Write,Agent,mcp__processo__iniciar_etapa,mcp__processo__entregar_spec,mcp__processo__entregar_codigo,mcp__processo__entregar_casos,mcp__processo__executar_testes"
```

Repita depois de `cp ../comum/respostas-exemplo.md respostas.md`.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `rodada-*/transcricao.md` | Mensagens, delegações e chamadas ao servidor, com a origem de cada chamada |
| `rodada-*/respostas.md` | Respostas disponíveis em cada rodada |
| `rodada-2/spec.*`, `rodada-3/spec.*` | Especificações entregues ao servidor |
| `rodada-3/filtrarTarefas.ts`, `casos.json`, `testes.txt` | Código final, casos e saída dos testes |
