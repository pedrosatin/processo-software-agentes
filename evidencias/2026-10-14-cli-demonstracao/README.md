# Experimento com o CLI em modo demonstração em 14/10/2026

## Pergunta

No cenário de rastreabilidade, um critério de saída escrito em código reprova uma entrega cujo código está correto e cujos testes passam?

## Montagem

| Item | Valor |
|---|---|
| Programa | [CLI da atividade](../../atividade), em TypeScript |
| Cenário | [02-rastreabilidade](../../atividade/cenarios/02-rastreabilidade) |
| Modo | `demonstracao`, padrão do CLI. As respostas dos agentes vêm de `cenarios/02-rastreabilidade/gravadas/` |
| Instruções dos agentes | Originais, em [agentes/](agentes), versões `7eebf5ba`, `1bc9a88c` e `9d7e3510` |
| Gate | `rastreabilidade`, em [atividade/src/gates.ts](../../atividade/src/gates.ts) |

No modo demonstração nenhum modelo é chamado e não há chave de API. As gravadas reproduzem a linha de base, com as instruções originais. O que esta execução mede é o comportamento do CLI e do gate sobre essas respostas.

O cenário traz a política do cliente em [politica-rastreabilidade.md](../../atividade/cenarios/02-rastreabilidade/politica-rastreabilidade.md): critérios com ID `C1`, `C2`, no máximo cinco critérios, cada caso citando o ID do critério que verifica. Na linha de base, `contexto.spec` e `contexto.tester` estão vazios em `processo.json`, e nenhum agente recebe a política.

## Fluxo observado

Reconstruído de [eventos.jsonl](eventos.jsonl). Os tempos são do relógio da execução.

```text
CLI                      spec        tester       coder       executor        gate
 │                        │            │            │             │              │
 │── pedido ─────────────►│ 10.535     │            │             │              │
 │◄─ spec.json ───────────│ 15 critérios, 0 dúvidas │             │              │
 │── spec.json ──────────────────────►│ 10.536     │             │              │
 │── spec.json ───────────────────────────────────►│ 10.537      │              │
 │◄─ casos.json ──────────────────────│ 5 casos    │             │              │
 │◄─ proposta.ts ─────────────────────────────────│             │              │
 │── proposta + casos do tester ─────────────────────────────────►│ 5/5 (10.666) │
 │── proposta + suíte de referência ─────────────────────────────►│ 7/7          │
 │── spec + casos ─────────────────────────────────────────────────────────────►│
 │◄─ reprovado, 21 apontamentos ────────────────────────────────────────────────│ 10.724
 │
 └─ encerramento reprovado, código de saída 1, 195 ms
```

Tester e coder recebem a especificação em paralelo, e o tester não vê o código. A suíte de referência mede a proposta final e não volta ao coder.

## Resultados

| Medida | Resultado |
|---|---|
| Chamadas aos agentes | 3, uma por papel |
| Tentativas do coder | 1, sem correção |
| Casos do tester | 5 de 5 |
| Suíte de referência | 7 de 7 |
| Gate `rastreabilidade` | Reprovado, 21 apontamentos |
| Encerramento | Reprovado, código de saída 1 |

Os 21 apontamentos de [gates.json](gates.json), agrupados:

| Regra da política | Apontamentos | Exemplo |
|---|---|---|
| Critério começa com ID | 15 | `Critério sem ID no início: "Com estado 'todas' e sem termo, a função retorna todas as ta"` |
| No máximo cinco critérios | 1 | `O spec tem 15 critérios e o tester entrega cinco casos` |
| Caso cita um ID existente | 5 | `Caso "Estado abertas retorna somente tarefas não concluídas" não cita um ID de critério existente` |

Formato esperado pela política e formato entregue pelo spec e pelo tester:

```diff
 "criterios": [
-  "Com estado 'todas' e sem termo, a função retorna todas as tarefas na ordem recebida. Entrada: ..."
+  "C1 Com estado 'todas' e sem termo, a função retorna todas as tarefas na ordem recebida. Entrada: ..."
 ]
 "casos": [{
   "nome": "Estado todas sem termo retorna todas as tarefas na ordem recebida",
-  "criterio": "Com estado 'todas' e sem termo, a função retorna todas as tarefas na ordem recebida.",
+  "criterio": "C1",
 }]
```

## Interpretação

O código passou nas duas suítes, e mesmo assim a entrega reprovou. A reprovação vem de uma regra do processo que nenhum teste de comportamento verifica: a ligação entre critério e caso. O spec produziu 15 critérios corretos e sem ID porque não recebeu a política. O tester, sem ela, escreveu cinco casos citando o texto do critério.

Esse é o ponto de partida da atividade. O aluno decide quais agentes precisam da política, altera o `contexto` em `processo.json` e as instruções desses agentes, e roda de novo no modo `api` ou `manual` até o gate aprovar.

## Limitações

- As respostas são gravadas. Esta execução demonstra o gate e o ciclo do CLI, e não diz nada sobre como um modelo responde às instruções.
- As gravadas valem apenas para as instruções originais. Instruções alteradas exigem o modo `api` ou o modo `manual`.
- O gate confere a forma da ligação entre critério e caso. Ele não avalia se o caso verifica de fato o critério que cita.

## Como reproduzir

Na pasta [atividade](../../atividade), com Node 22.13 ou posterior:

```bash
npm ci
npm run processo -- executar --cenario 2 --rotulo demonstracao
```

Com Docker:

```bash
docker compose -p aula-processo build
docker compose -p aula-processo run --rm processo executar --cenario 2 --rotulo demonstracao
```

A execução grava uma pasta nova em `artefatos/02-rastreabilidade/`.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `saida-terminal.txt` | Eventos e tabela-resumo impressos pelo CLI |
| `eventos.jsonl` | Eventos da execução em ordem, com horário |
| `configuracao.json` | Cenário, modo e versão das instruções de cada agente |
| `agentes/` | Instruções usadas por spec, coder e tester |
| `spec.json` | Especificação com 15 critérios |
| `casos.json` | Cinco casos do tester |
| `tentativa-0/` | Proposta do coder e resultado dos casos do tester |
| `proposta-final.ts`, `referencia.json` | Código final e resultado da suíte de referência |
| `gates.json`, `resumo.json` | Avaliação do gate e resumo da execução |
