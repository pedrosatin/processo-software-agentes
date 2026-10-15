# Evidências

Registros de execuções reais do processo spec, coder e tester sobre a função `filtrarTarefas`. Cada pasta descreve um experimento: a pergunta, a montagem, o fluxo observado, os resultados, a interpretação, as limitações e como reproduzir.

| Data | Experimento | Pergunta | Resultado |
|---|---|---|---|
| 04/10/2026 | [Gemini, verificação e validação](2026-10-04-gemini-validacao) | Os testes do tester detectam uma decisão errada do spec? | Verificação 5 de 5, validação 4 de 5 |
| 14/10/2026 | [Skills no Claude Code](2026-10-14-skills) | O spec para nas dúvidas? Com respostas, o processo completo entrega código correto? | Rodada 1 parou com 5 dúvidas. Rodada 2 com 24 de 24 casos e 14 de 14 na suíte de referência |
| 14/10/2026 | [Subagents no Claude Code](2026-10-14-subagents) | A conversa principal só delega e para nas dúvidas? | Rodada 1 parou com 6 dúvidas. Rodada 2 com 28 de 28 casos e 14 de 14 na suíte de referência |
| 14/10/2026 | [Servidor MCP](2026-10-14-mcp) | O host segue a ordem que o servidor libera? | Rodada 1 parada pelo servidor com 5 dúvidas. Rodada 2 com 23 de 23 casos e 14 de 14 na suíte de referência |
| 14/10/2026 | [Subagents, Skills e MCP integrados](2026-10-14-integrado) | O processo completa dúvida, teste e correção? | 7 dúvidas, depois 1 dúvida nova, depois 4 de 31 casos, correção pelo coder e 31 de 31 |
| 14/10/2026 | [CLI em modo demonstração](2026-10-14-cli-demonstracao) | Um gate em código reprova uma entrega com testes aprovados? | Tester 5 de 5, referência 7 de 7, gate de rastreabilidade reprovado |
| 15/10/2026 | [Antigravity e Codex](2026-10-15-agy-codex) | Os exemplos funcionam nos dois hosts, com ambiente isolado? | Parada nas dúvidas e testes cruzados por montagem; falhas e retestes documentados |
| 15/10/2026 | [CLI com Gemini API](2026-10-15-cli-api) | O cliente recebe respostas reais e chega aos testes e gates? | Base: 5/5, 7/7 e gate reprovado. Cópia ajustada: 5/5, 7/7 e gate aprovado |

O CLI agora fica em [demonstracoes/cli](../demonstracoes/cli). Os caminhos nas transcrições históricas preservam o nome `atividade/` usado na época; os comandos de reprodução nos READMEs apontam para a pasta atual.

## Leitura conjunta

```text
                         pedido ambíguo (maiúsculas, acentos, espaços)
                                         │
              ┌──────────────────────────┴──────────────────────────┐
              ▼                                                     ▼
   spec decide sozinho (04/10)                           spec registra dúvidas (14/10)
              │                                                     │
   tester e coder seguem a decisão                       pessoa responde, spec com 16 a 22 critérios
              │                                                     │
   verificação 5/5, validação 4/5                        24/24, 28/28 e 23/23 nos casos do tester
                                                         14/14 na suíte de referência (Skills, subagents e MCP)

   CLI (14/10): código correto nas duas suítes, entrega reprovada pela regra de
   rastreabilidade, que nenhum teste de comportamento verifica

   Integrado (14/10): o coder recebeu a especificação sem a assinatura, entregou
   parâmetros na ordem errada, os casos do tester pegaram e a correção passou
```

Os experimentos usam modelos, ferramentas e instruções diferentes. Eles mostram comportamentos que o processo precisa tratar e não servem para comparar modelos.

## Transcrições

[transcrever.mjs](transcrever.mjs) converte a saída `stream-json` do Claude Code em Markdown. Remove o identificador da sessão, troca caminhos locais e identificadores de subagentes e omite os conectores MCP da conta de quem executou.

```bash
node evidencias/transcrever.mjs stream.jsonl > transcricao.md
```

## Streams de Antigravity e Codex

`transcrever-harness.mjs` extrai comandos, ferramentas e mensagens finais desses hosts, com caminhos e identificadores removidos. O argumento opcional de sessão nativa do Codex exporta somente nomes de papéis das delegações, sem prompts opacos nem raciocínio.

```bash
node evidencias/transcrever-harness.mjs stream.jsonl
node --test evidencias/transcrever-harness.test.mjs
```

## Limite da checagem da lista

Os registros antigos de `demonstracoes/comum/testar.mjs` trazem o rodapé "Cada caso também confere que a lista recebida não foi alterada". A checagem da lista acontece quando a função retorna sem lançar erro. Nos casos que esperam erro, o script confere a mensagem, sem verificar mutação anterior à exceção. Os registros originais foram preservados; a saída atual do script e a [parte 1](../docs/tutorial/01-testes-de-referencia.md) explicitam esse limite.
