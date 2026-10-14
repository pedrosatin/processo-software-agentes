# Experimento com Skills em 14/10/2026

## Pergunta

Quando o processo spec, coder e tester está escrito como Skills do Claude Code, o spec para diante de um pedido ambíguo? Com as dúvidas respondidas, a Skill `processo` executa os três papéis em ordem, mantém o tester sem acesso ao código e entrega uma função que passa nos testes?

## Montagem

| Item | Valor |
|---|---|
| Ferramenta | Claude Code em modo não interativo (`claude -p`) |
| Modelo | Haiku (`claude-haiku-5-5`) |
| Instruções | [demonstracoes/skills/.claude/skills](../../demonstracoes/skills/.claude/skills), versão do commit `ec89cbf` |
| Pedido | [demonstracoes/comum/pedido.md](../../demonstracoes/comum/pedido.md), que não diz como tratar maiúsculas, acentos e espaços |
| Ferramentas liberadas | `Read`, `Write`, `Skill`, `Agent` e, no Bash, apenas `ls`, `cat`, `pwd` e `node ../comum/testar.mjs` |
| Permissões | `--permission-mode dontAsk`, que recusa sem perguntar qualquer chamada fora da lista |

A variável entre as rodadas é o arquivo `respostas.md`.

| Rodada | Comando | `respostas.md` |
|---|---|---|
| 1 | `/spec` | Só o cabeçalho, sem respostas |
| 2 | `/processo` | Cópia de [respostas-exemplo.md](../../demonstracoes/comum/respostas-exemplo.md), com dez respostas |

## Rodada 1. O spec para nas dúvidas

```text
Conversa principal
 │
 ├─ Bash  ls e cat em lote ─────────── recusado (comando composto fora da lista)
 ├─ Read  pedido.md
 ├─ Read  respostas.md ─────────────── sem respostas
 └─ Write saida/spec.md ────────────── 7 critérios e 5 dúvidas
                                       a execução termina pedindo as respostas
```

O spec registrou cinco dúvidas, cada uma com uma entrada concreta e os dois resultados possíveis ([rodada-1/spec.md](rodada-1/spec.md)).

| Dúvida | Entrada | Resultados possíveis |
|---|---|---|
| D01 | Termo `"pão"`, título `"Comprar Pão"` | Inclui ou não inclui |
| D02 | Termo `"cafe"`, título `"Café da manhã"` | Ignora acentos ou compara literalmente |
| D03 | Termo `"compr"`, título `"Comprar pão"` | Trecho do título ou palavra inteira |
| D04 | Termo `"   "` com estado `abertas` | Trata como ausente ou busca literalmente |
| D05 | Estado `"pendentes"` | Lança erro ou retorna lista vazia |

A rodada parou na etapa do spec, sem coder e sem tester. Duração de 27 s, 5 turnos e custo informado pelo Claude Code de US$ 0,006.

## Rodada 2. Processo completo com as respostas

```text
Conversa principal           Skill spec          Skill coder (fork)     Skill tester (fork)
 │                             │                     │                      │
 │── /processo                 │                     │                      │
 │── Skill spec ──────────────►│                     │                      │
 │                             │ Read pedido.md      │                      │
 │                             │ Read respostas.md   │                      │
 │                             │ Write spec.md       │                      │
 │                             │ 21 critérios        │                      │
 │                             │ 0 dúvidas           │                      │
 │── Skill coder ────────────────────────────────────►│                      │
 │                             │                     │ Bash find / recusado │
 │                             │                     │ Read spec.md         │
 │                             │                     │ Read falhas.txt      │
 │                             │                     │  (não existe)        │
 │                             │                     │ Write filtrarTarefas.ts
 │── Skill tester ───────────────────────────────────────────────────────────►│
 │                             │                     │                      │ Read spec.md
 │                             │                     │                      │ Write casos.json
 │── Bash node ../comum/testar.mjs ──► 24 de 24 casos aprovados
```

Coder e tester rodaram com `context: fork`, em subagentes sem o histórico da conversa. O tester leu somente `saida/spec.md` e não abriu `filtrarTarefas.ts`. Como os testes passaram na primeira execução, a etapa de correção não foi acionada. Duração de 76 s, 14 turnos e custo informado de US$ 0,018.

Código entregue pelo coder ([rodada-2/filtrarTarefas.ts](rodada-2/filtrarTarefas.ts)):

```ts
const termo = (filtro.termo ?? '').trim().toLowerCase()

return tarefas.filter((tarefa) => {
  if (estado === 'abertas' && tarefa.concluida) return false
  if (estado === 'concluidas' && !tarefa.concluida) return false
  if (termo === '') return true
  return tarefa.titulo.toLowerCase().includes(termo)
})
```

## Resultados

| Medida | Rodada 1 | Rodada 2 |
|---|---|---|
| Etapas executadas | spec | spec, coder, tester, testes |
| Critérios na especificação | 7 | 21 |
| Dúvidas registradas | 5 | 0 |
| Casos escritos pelo tester | | 24, cobrindo C01 a C21 |
| Casos do tester contra o código do coder | | 24 de 24 |
| Chamadas recusadas pela lista de ferramentas | 1 | 2 |
| Duração | 27 s | 76 s |

### Checagem cruzada

Os 24 casos aprovados mostram que código e casos concordam entre si. Os dois podem estar errados da mesma forma quando ambos seguem uma especificação errada. Para separar as duas coisas, os artefatos foram cruzados com a implementação e a suíte de referência de [demonstracoes/comum/exemplo](../../demonstracoes/comum/exemplo), escritas à mão a partir das respostas.

| Suíte | Implementação | Resultado |
|---|---|---|
| Casos do tester | Referência | 24 de 24 |
| Casos de referência | Código do coder | 14 de 14 |

```bash
# pasta a: casos.json e spec.md desta rodada, filtrarTarefas.ts de comum/exemplo
# pasta b: casos.json e spec.md de comum/exemplo, filtrarTarefas.ts desta rodada
node demonstracoes/comum/testar.mjs a
node demonstracoes/comum/testar.mjs b
```

## Interpretação

O spec tratou as lacunas do pedido como dúvidas e parou, sem escolher uma das alternativas. Com as respostas no arquivo, os critérios passaram de 7 para 21 e cada resposta virou pelo menos um critério testável, como C10 (`"strasse"` não encontra `"Straße"`) e C18 (acento combinado U+0301). A separação de contexto funcionou como prevista: o tester escreveu os casos só a partir da especificação. A checagem cruzada indica que a especificação gerada está alinhada às respostas, já que o código do coder passa na suíte independente.

## Limitações

- Uma execução por rodada, com um modelo. A variação entre execuções não foi medida.
- Na rodada 2 as respostas vieram prontas de um arquivo. Em sala, quem responde é a pessoa responsável pelo pedido, na conversa.
- O coder tentou ler `saida/falhas.txt`, que ainda não existia, e tentou um `find /`, recusado. As duas chamadas não mudaram o resultado e mostram que a lista de ferramentas liberadas limita o que o agente executa.
- O custo é o valor informado pelo próprio Claude Code na saída `stream-json`.

## Como reproduzir

Na pasta [demonstracoes/skills](../../demonstracoes/skills), com o Claude Code instalado:

```bash
claude -p "/spec" --model haiku --permission-mode dontAsk \
  --allowedTools "Read,Write,Skill,Agent,Bash(ls:*),Bash(cat:*),Bash(pwd),Bash(node ../comum/testar.mjs:*)"
cp ../comum/respostas-exemplo.md respostas.md
claude -p "/processo" --model haiku --permission-mode dontAsk --allowedTools "<mesma lista>"
node ../comum/testar.mjs
```

Em modo interativo, basta abrir o Claude Code na pasta e digitar `/spec` ou `/processo`.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `rodada-*/transcricao.md` | Mensagens do modelo, chamadas de ferramenta e resultados, gerados por [transcrever.mjs](../transcrever.mjs) |
| `rodada-*/respostas.md` | Respostas disponíveis para o spec |
| `rodada-*/spec.md` | Especificação gerada |
| `rodada-2/filtrarTarefas.ts` | Código do coder |
| `rodada-2/casos.json` | Casos do tester |
| `rodada-2/testes.txt` | Saída de `node ../comum/testar.mjs` |
