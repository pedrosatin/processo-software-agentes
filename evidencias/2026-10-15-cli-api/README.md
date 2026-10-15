# CLI com Gemini API em 15/10/2026

## Pergunta

O modo `api` autentica no Gemini, recebe JSON válido nos três papéis e executa as verificações e os gates do cenário 2?

## Montagem

CLI executado com Node, pelo endpoint compatível com Chat Completions do Gemini. A chave foi recebida apenas pela entrada do processo supervisor e passada ao CLI no ambiente. Ela não foi gravada em `.env`, comandos, instruções ou evidências.

O catálogo autenticado confirmou disponibilidade de `gemini-3.5-flash-lite`. A [tabela oficial de preços](https://ai.google.dev/gemini-api/docs/pricing#gemini-3.5-flash-lite) lista uma faixa gratuita para esse modelo. Isso não identifica a categoria de faturamento da conta nem mede cobrança.

| Execução | Configuração | Modelo configurado | Resultado do tester | Referência | Gate rastreabilidade | Saída |
|---|---|---|---|---|---|---|
| [Base](base/resumo.json) | Instruções e contexto originais do cenário 2 | `gemini-flash-lite-latest` | 5/5 | 7/7 | Reprovado | 1 |
| [Ajustada](corrigido/resumo.json) | Cópia local com instruções e contexto do material do professor | `gemini-3.5-flash-lite` | 5/5 | 7/7 | Aprovado | 0 |

Cada execução fez três chamadas ao modelo (spec, tester e coder), com uma entrega do coder. A base levou 13.114 ms e a ajustada 9.682 ms. As durações descrevem estas execuções; não medem desempenho geral do modelo ou do serviço.

## Leitura dos resultados

Na base, a chamada à API funcionou e os dois conjuntos de testes aprovaram o comportamento. A entrega foi reprovada por critérios sem o identificador exigido pelo cenário, como registrado em [base/gates.json](base/gates.json). Esse é o defeito de processo que o exercício pede ao aluno investigar.

Na cópia ajustada, o gate recebeu critérios com identificadores e encontrou os casos correspondentes. O CLI encerrou como `aprovado`, com os três placares aprovados. Os arquivos do aluno no repositório não foram alterados para executar a cópia do professor.

As duas execuções usam configurações de modelo diferentes. Elas validam dois caminhos reais do cliente, sem isolar o efeito das instruções numa comparação controlada de modelo. As instruções, os materiais e a cópia do professor permanecem locais. A evidência distribuída traz somente os resumos, placares e eventos.

## Alias e fallback

O alias `gemini-flash-lite-latest` respondeu nesta chave e data. A execução base não registrou substituição de modelo, remoção de `response_format` nem retentativa por HTTP 429/503. A ausência do alias numa página de documentação não comprovava que ele fosse inválido.

Os fallbacks continuam cobertos pelos testes HTTP locais. Este ensaio real não acionou esses ramos e não comprova que outro modelo ou uma conta nova terá a mesma disponibilidade ou cota. O modelo informado em `resumo.json` é o configurado; os eventos `uso` registram o nome enviado pelo cliente, sem comprovar a revisão interna resolvida pelo alias.

## Reproduzir

Siga a [parte 3 do tutorial](../../docs/tutorial/03-cli.md). Use uma chave própria no ambiente e mantenha o modelo disponível na sua conta. Para usar Node em um clone novo, entre no diretório `demonstracoes/cli` e instale as dependências uma vez com `npm ci`, como no [README do CLI](../../demonstracoes/cli/README.md#executar-com-node). Depois execute o cenário 2:

```bash
npm run processo -- executar --cenario 2 --rotulo antes --modo api
```

Uma saída 1 com testes aprovados e gate de rastreabilidade reprovado é um resultado de avaliação do cenário. Erros de autenticação, rede, formato e limite do provedor devem ser analisados separadamente.
