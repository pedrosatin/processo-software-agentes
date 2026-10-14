# Experimento com subagents em 14/10/2026

## Pergunta

Com um subagent por papel e a ordem do processo escrita no `CLAUDE.md`, a conversa principal delega cada etapa sem fazer o trabalho dos papéis, para nas dúvidas do spec e roda coder e tester em contextos separados?

## Montagem

| Item | Valor |
|---|---|
| Ferramenta | Claude Code em modo não interativo (`claude -p`) |
| Modelo | Haiku (`claude-haiku-5-5`), na conversa principal e nos subagents |
| Instruções | [demonstracoes/subagents](../../demonstracoes/subagents): `CLAUDE.md` e `.claude/agents/spec.md`, `coder.md`, `tester.md` |
| Prompt | `Execute o processo de desenvolvimento para pedido.md.` |
| Ferramentas liberadas | `Read`, `Write`, `Agent` e, no Bash, apenas `ls`, `cat`, `pwd` e `node ../comum/testar.mjs` |
| Permissões | `--permission-mode dontAsk` |

| Rodada | `respostas.md` |
|---|---|
| 1 | Só o cabeçalho, sem respostas |
| 2 | Cópia de [respostas-exemplo.md](../../demonstracoes/comum/respostas-exemplo.md) |

## Rodada 1. O spec devolve dúvidas

```text
Conversa principal                 subagent spec
 │                                   │
 ├─ Bash ls; find ── recusado        │
 ├─ Read pedido.md                   │
 ├─ Read CLAUDE.md                   │
 ├─ Agent spec ─────────────────────►│ Read pedido.md
 │                                   │ Read respostas.md (vazio)
 │                                   │ Write saida/spec.md
 │                                   │ Write saida/spec.md (reescrita)
 │◄──────────── 10 critérios, 6 dúvidas
 └─ mostra as dúvidas e para
```

As seis dúvidas ([rodada-1/spec.md](rodada-1/spec.md)) cobrem maiúsculas (`"RELATORIO"` contra `"Relatorio mensal"`), acentos, espaços nas bordas, trecho de palavra, estado desconhecido (`"pendentes"`) e estado em maiúsculas (`"ABERTAS"`). Duração de 11 s.

## Rodada 2. Processo completo

```text
Conversa principal        spec              coder              tester
 │                         │                  │                  │
 ├─ Agent spec ───────────►│ Read pedido.md   │                  │
 │                         │ Read respostas.md│                  │
 │                         │ Write spec.md    │                  │
 │◄─ 16 critérios, 0 dúvidas                  │                  │
 ├─ Read spec.md, respostas.md                │                  │
 ├─ Agent coder ─────────────────────────────►│ Read spec.md     │
 ├─ Agent tester ────────────────────────────────────────────────►│ Read spec.md
 │                         │                  │ Write .ts        │ Write casos.json
 └─ Bash node ../comum/testar.mjs ──► 28 de 28 casos aprovados
```

Coder e tester foram disparados na mesma resposta e rodaram em paralelo. Cada um leu apenas `saida/spec.md`. A conversa principal não escreveu especificação, código nem casos. Duração de 69 s e 10 turnos.

## Resultados

| Medida | Rodada 1 | Rodada 2 |
|---|---|---|
| Etapas executadas | spec | spec, coder e tester em paralelo, testes |
| Critérios | 10 | 16 |
| Dúvidas | 6 | 0 |
| Casos do tester contra o código do coder | | 28 de 28 |
| Casos do tester contra a implementação de referência | | 28 de 28 |
| Suíte de referência contra o código do coder | | 14 de 14 |

A checagem cruzada usa [demonstracoes/comum/exemplo](../../demonstracoes/comum/exemplo), como no [experimento com Skills](../2026-10-14-skills).

## Dúvida que as respostas deixaram aberta

As duas execuções da rodada 2 feitas neste dia usaram as mesmas dez respostas. A execução desta pasta seguiu até os testes. Uma execução anterior, cujos arquivos não foram preservados, parou com uma dúvida nova: quando nenhuma tarefa é descartada, o resultado é um array novo ou o próprio array recebido? A resposta 10 trata dos objetos e não do array. A conversa principal mostrou a dúvida e parou, como manda o `CLAUDE.md`. Depois disso a resposta 11 foi acrescentada a `respostas-exemplo.md`. A mesma dúvida está registrada na rodada 2 do [experimento integrado](../2026-10-14-integrado).

## Interpretação

O `CLAUDE.md` funcionou como definição do processo: a conversa principal só delegou, levou as dúvidas à pessoa e rodou os testes. A separação de contexto vem do mecanismo de subagents, porque cada papel recebe só o texto da delegação e lê os arquivos que a instrução permite. Com o mesmo pedido e as mesmas respostas, o spec gerou 16 critérios aqui e 21 nas Skills, e as duas entregas passaram na suíte de referência.

## Limitações

- Uma execução por rodada, com um modelo.
- O número de dúvidas e de critérios varia entre execuções. A dúvida sobre o array apareceu em uma execução e não em outra, com instruções equivalentes.
- A recusa do comando composto `ls ...; find ...` na conversa principal não mudou o resultado.

## Como reproduzir

Na pasta [demonstracoes/subagents](../../demonstracoes/subagents):

```bash
claude -p "Execute o processo de desenvolvimento para pedido.md." --model haiku --permission-mode dontAsk \
  --allowedTools "Read,Write,Agent,Bash(ls:*),Bash(cat:*),Bash(pwd),Bash(node ../comum/testar.mjs:*)"
cp ../comum/respostas-exemplo.md respostas.md
claude -p "Execute o processo de desenvolvimento para pedido.md." --model haiku --permission-mode dontAsk --allowedTools "<mesma lista>"
```

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `rodada-*/transcricao.md` | Mensagens, chamadas de ferramenta e resultados, com a origem de cada chamada (conversa principal ou subagent) |
| `rodada-*/respostas.md`, `spec.md` | Respostas disponíveis e especificação gerada |
| `rodada-2/filtrarTarefas.ts`, `casos.json`, `testes.txt` | Código, casos e saída dos testes |
