# Processo com CLI

CLI em TypeScript que executa os agentes spec, coder e tester sobre a função `filtrarTarefas` e avalia o resultado com gates, os critérios de saída de cada cenário.

## Executar com Docker

```bash
docker compose -p aula-processo build
docker compose -p aula-processo run --rm processo cenarios
docker compose -p aula-processo run --rm processo executar --cenario 1 --rotulo antes
docker compose -p aula-processo run --rm processo comparar --cenario 1
```

O serviço monta `agentes/`, `cenarios/` e `entradas/` só para leitura e grava em `artefatos/`. Alterações nas instruções valem na execução seguinte, sem reconstruir a imagem. Em Linux com UID diferente de 1000, libere a escrita com `chmod -R a+w artefatos`.

## Executar com Node

Com Node 22.13 ou posterior instalado:

```bash
npm ci
npm run processo -- executar --cenario 1 --rotulo antes
```

## Modos de resposta

| Modo | Origem das respostas | Variáveis |
|---|---|---|
| `demonstracao` | `cenarios/<id>/gravadas/`, padrão | Nenhuma |
| `api` | Endpoint compatível com Chat Completions | `GEMINI_API_KEY` ou `LLM_API_KEY`, `LLM_BASE_URL`, `MODELO` |
| `manual` | Arquivo de resposta criado pelo aluno | Nenhuma |

O modo `api` usa por padrão o Gemini com `gemini-flash-lite-latest`. Se o alias padrão retornar 404 no endpoint padrão Gemini, o CLI consulta `/models`, prioriza um Flash-Lite estável e registra `modelo-substituido`. Sem Flash-Lite, tenta um Flash estável. Um `MODELO` diferente do padrão ou `LLM_BASE_URL` explícito permanece fixo e o erro pede a revisão da configuração. A listagem do provedor não confirma gratuidade ou cota, que devem ser conferidas no AI Studio. Quando o provedor recusa `response_format`, a chamada é repetida sem esse campo e o evento `formato-json-desligado` é registrado. Para Groq, defina `LLM_BASE_URL=https://api.groq.com/openai/v1`, `LLM_API_KEY` e `MODELO`. Respostas 429 e 503 são repetidas após 2, 5 e 10 segundos.

Ensaio real do modo `api` com Gemini em 15/10/2026: [montagem e resultados](../../evidencias/2026-10-15-cli-api). A base do cenário 2 chegou aos testes e reprovou o gate de rastreabilidade; uma cópia ajustada terminou aprovada.

As gravadas reproduzem a linha de base com as instruções originais. Instruções alteradas exigem o modo `api` ou `manual`.

## Ciclo

1. O spec recebe o pedido, as respostas de `entradas/respostas.md` e os materiais listados em `contexto.spec`. Dúvidas encerram a execução com código 3.
2. Tester e coder recebem o spec em paralelo. O tester escreve cinco casos sem ver o código.
3. O executor roda a proposta com os casos do tester. Falhas e violações dos gates de `revisaoNoCiclo` voltam ao coder até `limiteCorrecoes`.
4. A suíte de referência, em `cenarios/referencia.json`, mede a proposta final e não volta ao coder.
5. Os gates do cenário avaliam o resultado. Código de saída 0 quando tester e gates aprovam, 1 quando reprovam.

A proposta roda em outro processo Node com `--permission`, sem variáveis de chave do processo pai, com restrições de escrita em disco e criação de processos e com prazo de 10 segundos. O processo filho lê só o módulo transpilado e o executor.

Esses controles foram testados para escrita em arquivo, criação de processo, remoção de uma variável de chave do pai e prazo de execução. O filho recebe apenas `PATH`. O [Permission Model do Node.js](https://nodejs.org/api/permissions.html) restringe operações e não oferece garantia de segurança contra código malicioso.

## Conferir o executor

```bash
npm test
npm run typecheck
```

Os testes do verificador também ficam na imagem Docker:

```bash
docker compose -p aula-processo run --rm --entrypoint npm processo test
```

`npm test` executa os testes do verificador, dos contratos e do cliente do modo `api`, este com um provedor falso em `127.0.0.1`. O verificador aceita tarefas diferentes com IDs repetidos e compara os valores dos objetos devolvidos com os da entrada.

O arquivo `entradas/respostas.md` define a busca por qualquer trecho do título com `includes()`. Essa definição resolve a dúvida entre busca por trecho, palavra ou título inteiro antes da implementação.

## Arquivos de cada execução

| Arquivo | Conteúdo |
|---|---|
| `configuracao.json` | Cenário, modo, modelo, hash das instruções e `processo.json` usado |
| `agentes/` | Cópia das instruções usadas |
| `spec.json`, `casos.json` | Saídas validadas do spec e do tester |
| `tentativa-N/` | Proposta, explicação do coder e resultado da verificação |
| `referencia.json`, `gates.json` | Medição final |
| `resumo.json` | Encerramento, tentativas, chamadas, placares e gates |
| `eventos.jsonl` | Uma linha JSON por evento |
| `manual/` | Pedidos e respostas do modo manual |

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `agentes/` | Instruções editáveis dos três agentes |
| `cenarios/` | Processo, materiais, gravadas e README de cada cenário, mais a referência |
| `entradas/respostas.md` | Respostas da pessoa responsável pelo pedido às dúvidas do spec |
| `src/cli.ts` | Comandos `cenarios`, `executar` e `comparar` |
| `src/ciclo.ts` | Orquestração do ciclo |
| `src/gates.ts` | Gates por nome |
| `src/verificacao.ts`, `src/executor.mjs` | Execução isolada da proposta |
| `src/modelo.ts` | Modos de resposta |
