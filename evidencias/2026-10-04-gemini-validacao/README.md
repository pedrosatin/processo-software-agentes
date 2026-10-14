# Experimento com o Gemini em 04/10/2026

## Pergunta

Se o spec decide sozinho um ponto ambíguo do pedido, os testes escritos a partir da especificação detectam o problema?

## Montagem

| Item | Valor |
|---|---|
| Laboratório | Versão anterior a este repositório, com cada agente em um serviço Docker Compose |
| Modelo | `gemini-flash-lite-latest`, pelo endpoint compatível com Chat Completions do Google AI Studio (`MODO=api`) |
| Pedido | `filtrarTarefas`, o mesmo de [demonstracoes/comum/pedido.md](../../demonstracoes/comum/pedido.md), sem dizer como tratar maiúsculas |
| Respostas a dúvidas | Nenhuma |
| Suítes | Cinco casos escritos pelo tester e cinco testes de aceitação escritos à mão a partir do pedido |

Duas suítes medem coisas diferentes. A verificação compara o código com a especificação, usando os casos do tester. A validação compara o código com o pedido, usando a suíte de referência, que não volta ao coder.

## Fluxo observado

```text
pedido ──► spec ──► spec.json
                    critério 5: "contém o termo (case-sensitive e sem remoção de acentos)"
                    dúvidas: []
                        │
           ┌────────────┴────────────┐
           ▼                         ▼
        tester                     coder
        casos.json                 proposta.ts
        nenhum caso com            titulo.includes(termoLimpo)
        letras no termo            sem toLowerCase
           │                         │
           └────────────┬────────────┘
                        ▼
        verificação  casos do tester x proposta  ──► 5 de 5
        validação    suíte de referência x proposta ──► 4 de 5
                     falha "Termo em maiúsculas": esperava [2], recebeu []
```

## Resultados

| Suíte | Compara o código com | Resultado |
|---|---|---|
| Casos do tester | A especificação do spec | 5 de 5 |
| Testes de aceitação | O pedido | 4 de 5. Falhou "Termo em maiúsculas" |

Os cinco casos do tester ([casos.json](casos.json)):

| Caso | Filtro |
|---|---|
| `estadoInvalido` | `{ estado: "desconhecido" }` |
| `todasSemTermo` | `{ estado: "todas" }` |
| `apenasAbertas` | `{ estado: "abertas" }` |
| `apenasConcluidas` | `{ estado: "concluidas" }` |
| `termoVazioBorda` | `{ estado: "abertas", termo: "   " }` |

Trecho da proposta da tentativa 2 ([proposta.ts](proposta.ts)):

```ts
const termoLimpo = filtro.termo !== undefined ? filtro.termo.trim() : ''
// ...
if (termoLimpo !== '') {
  atendeTermo = tarefa.titulo.includes(termoLimpo)
}
```

## Interpretação

O spec escolheu comparação com distinção de maiúsculas e registrou isso como critério, sem abrir dúvida ([spec.json](spec.json)). Tester e coder seguiram a especificação, e por isso a verificação aprovou. Nenhum caso do tester buscava um termo com letras, então nem a escolha do spec foi exercitada pelos testes dele. A falha apareceu só na validação, que parte do pedido. Como a suíte de referência não volta ao coder, o ciclo terminou sem uma falha que o coder pudesse corrigir.

O mesmo ponto ambíguo aparece no [experimento com Skills de 14/10](../2026-10-14-skills), em que o spec registrou a dúvida D01 sobre maiúsculas e parou. Os dois experimentos diferem em modelo, ferramenta e instruções, então a comparação ilustra os dois comportamentos possíveis e não isola a causa.

## Limitações

- Uma execução, com um modelo. Foram preservados apenas os arquivos da tentativa 2.
- O laboratório usado foi substituído por este repositório. O relatório segue o formato antigo, em que `aprovado` exigia tester e referência.
- A proposta declara `id: string`, divergente do tipo do pedido (`id: number`). Nenhuma das duas suítes acusou essa divergência.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `spec.json` | Especificação gerada pelo spec |
| `casos.json` | Cinco casos gerados pelo tester |
| `proposta.ts` | Código da tentativa 2 |
| `relatorio.json` | Placar do tester e da suíte de referência na tentativa 2 |
