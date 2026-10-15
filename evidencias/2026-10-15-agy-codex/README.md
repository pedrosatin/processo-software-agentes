# Ensaios com Antigravity e Codex em 15/10/2026

## Pergunta

Os exemplos de Skills, subagents, MCP e integração conseguem parar nas dúvidas e entregar a função `filtrarTarefas` em Antigravity CLI e Codex CLI? Os casos gerados e o código também passam quando cruzados com a referência independente?

## Montagem

- Antigravity CLI 1.3.5, modelo `gemini-3.8-flash-medium`.
- Codex CLI 0.162.1, modelo `gpt-6.1-sol`, confirmado nos registros nativos das sessões.
- Cópias de trabalho independentes, base `346843b`. O campo `base_commit` em `resultados.json` identifica a base de cada execução. Quando existe `instrucoes-ensaio.md`, esse arquivo registra as instruções locais adicionais testadas sobre a base. O reteste integrado do Antigravity inclui também `papeis-agy/` e remove os agentes Markdown defeituosos da base.
- Rodada 1 com `respostas.md` vazio. Rodada 2 com as onze respostas de `respostas-exemplo.md`. Os arquivos efetivamente usados acompanham cada rodada.
- HOME isolado do Antigravity. No Codex, HOME e CODEX_HOME isolados, com apenas a autenticação necessária e confiança nos diretórios dos ensaios. As Skills e agentes pessoais do professor ficaram fora do catálogo dos retestes selecionados.
- Execução automática em diretórios de ensaio: `agy -p` com `--output-format stream-json --dangerously-skip-permissions`; Codex com `exec -s workspace-write --json`. Esses parâmetros descrevem o ensaio do professor. O tutorial dos alunos usa a interface interativa com as permissões normais.
- Nos ensaios MCP e integrado do Codex selecionados, o servidor recebeu o executável Node explícito pela opção de sessão `-c 'mcp_servers.processo.command="/usr/bin/node"'`. O caminho pertence à máquina do ensaio. Não foi gravado nos arquivos de configuração portáveis do repositório.

As contas usadas são do professor. O teste não comprova a cota ou a disponibilidade de modelos de uma conta gratuita nova.

## Resultados por execução

Cada link inclui o extrato da conversa e os artefatos produzidos. Aprovação é a saída do script de teste executado sobre os arquivos entregues, não apenas o resumo do modelo.

| Ensaio | Resultado | Casos de referência contra o código |
|---|---|---|
| [agy-mcp-processo-r1](agy-mcp-processo-r1/transcricao.md) | Parou na spec com dúvidas | não executada |
| [agy-mcp-processo-r2](agy-mcp-processo-r2/transcricao.md) | 10 de 10 casos aprovados | 14 de 14 casos aprovados |
| [agy-skills-r1](agy-skills-r1/transcricao.md) | Parou na spec com dúvidas | não executada |
| [agy-skills-r2](agy-skills-r2/transcricao.md) | 11 de 11 casos aprovados | 14 de 14 casos aprovados |
| [agy-subagents-r1](agy-subagents-r1/transcricao.md) | Parou na spec com dúvidas | não executada |
| [agy-subagents-r2](agy-subagents-r2/transcricao.md) | 14 de 14 casos aprovados | 14 de 14 casos aprovados |
| [agy-integrado-r1](agy-integrado-r1/transcricao.md) | Interrompido durante diagnóstico do host | não executada |
| [codex-skills-r1-final-isolado](codex-skills-r1-final-isolado/transcricao.md) | Parou na spec com dúvidas | não executada |
| [codex-skills-r2-isolado](codex-skills-r2-isolado/transcricao.md) | 33 de 33 casos aprovados | 14 de 14 casos aprovados |
| [codex-subagents-r1-isolado](codex-subagents-r1-isolado/transcricao.md) | Parou na spec com dúvidas | não executada |
| [codex-subagents-r2-isolado](codex-subagents-r2-isolado/transcricao.md) | 32 de 32 casos aprovados | 14 de 14 casos aprovados |
| [codex-mcp-processo-r1-node-explicito](codex-mcp-processo-r1-node-explicito/transcricao.md) | Parou na spec com dúvidas | não executada |
| [codex-mcp-processo-r2-node-explicito](codex-mcp-processo-r2-node-explicito/transcricao.md) | 20 de 20 casos aprovados | 14 de 14 casos aprovados |
| [codex-integrado-r1-node-explicito](codex-integrado-r1-node-explicito/transcricao.md) | Parou na spec com dúvidas | não executada |
| [codex-integrado-r2-node-explicito](codex-integrado-r2-node-explicito/transcricao.md) | 42 de 42 casos aprovados | 14 de 14 casos aprovados |
| [agy-integrado-r1-corrigido](agy-integrado-r1-corrigido/transcricao.md) | Parou na spec com dúvidas | não executada |
| [agy-integrado-r2-corrigido](agy-integrado-r2-corrigido/transcricao.md) | 28 de 28 casos aprovados | 14 de 14 casos aprovados |

O número de casos varia porque cada tester escreve sua própria suíte. Estes ensaios não medem qual modelo é melhor. Além da tabela, o arquivo `casos-do-tester-x-referencia.txt` de cada rodada completa mostra o cruzamento inverso: casos gerados pelo tester executados contra a implementação de referência. `resultados.json` contém as duas contagens e o SHA-256 do stream original preservado localmente.

## Delegações e separação do tester

O stream principal do Antigravity registra `invoke_subagent` e os nomes dos papéis. O Codex não exportou todas as chamadas de criação no `--json`; os nomes e tipos de papéis foram recuperados dos eventos `spawn_agent` do registro nativo, disponíveis em `delegacoes.json` e no cabeçalho do extrato. Foram exportados somente nomes dos papéis, sem argumentos opacos nem identificadores de sessão.

Nas Skills do Codex, coder e tester aparecem como agentes de tipo padrão. Na demonstração de subagents, spec, coder e tester usam seus tipos nomeados. A existência da delegação comprova contextos de execução separados. O extrato do agente principal não comprova todas as leituras internas de cada filho. A ausência de leitura do código pelo tester precisa ser conferida no registro interno do papel para uma auditoria completa. Nos ensaios Antigravity, `subagentes-ferramentas.json` registra nomes das ferramentas e caminhos relativos lidos pelos filhos, sem mensagens internas. No reteste integrado, o tester leu quatro descritores de ferramentas MCP e usou `iniciar_etapa` e `entregar_casos`; não há leitura do código nas chamadas registradas. Na demonstração de subagents, o tester leu `saida/spec.md` e gravou seus casos. Essas observações descrevem as execuções, sem transformar a instrução de isolamento em bloqueio técnico de leitura.

No integrado do Claude, cada papel tem uma lista específica de ferramentas. No Codex, o shell dos papéis está desligado. No Antigravity corrigido, as orientações das Skills são incorporadas ao `system_prompt` dos agentes temporários e o MCP é habilitado por `enable_mcp_tools`. Desligar gravação não remove as ferramentas de leitura, e habilitar MCP não restringe cada papel a somente duas ferramentas. Portanto, estas montagens não demonstram o mesmo isolamento de capacidades entre hosts.

## Falhas encontradas e correções

### Codex com configuração pessoal

Os primeiros ensaios usavam CODEX_HOME separado, mantendo o HOME real. O catálogo ainda incluía Skills pessoais. Esses resultados ficaram fora da tabela: os retestes selecionados usam também HOME isolado. Uma tentativa de spec ainda leu um arquivo de instruções num diretório ancestral. Essa transcrição preliminar ficou apenas local. O reteste `codex-skills-r1-final-isolado` restringiu a leitura aos arquivos do repositório e substitui essa tentativa na tabela. HOME separado retira a configuração pessoal do catálogo, mas não bloqueia por si só toda leitura fora do projeto.

### Codex com Node resolvido pelo ambiente

No ambiente isolado, a configuração com `command = "node"` aparecia em `codex mcp list`, mas as ferramentas não estavam disponíveis na sessão. O modelo chegou a conversar com o servidor via JSON-RPC no terminal. Esse resultado não comprova conexão MCP nativa e ficou fora da tabela. A causa exata da diferença de resolução do ambiente não foi confirmada.

Ao informar o executável Node diretamente na sessão, os eventos `mcp_tool_call` comprovaram as chamadas nativas. O tutorial orienta conferir o Node resolvido pelo host e distinguir listagem de servidor de execução efetiva de ferramentas. Uma instrução adicional agora encerra a demonstração quando a conexão nativa falta, em vez de substituir o transporte pelo shell.

### Antigravity integrado

A primeira configuração colocou `call_mcp_tool` em `tools` de um agente Markdown. O spec falhou antes de construir o executor:

```text
failed to construct executor: failed to resolve components: unknown component: tool "call_mcp_tool" not found in registry
```

O erro está em [erro-host.txt](agy-integrado-r1/erro-host.txt). A execução principal foi interrompida durante o diagnóstico. A correção prepara os papéis com `define_subagent(enable_mcp_tools: true)`, conforme a [referência de ferramentas](https://antigravity.google/docs/hooks#agent-collaboration) e as correções de dispatcher e herança MCP no [changelog](https://antigravity.google/docs/changelog?tab=cli). Os retestes com sufixo `corrigido` pararam nas dúvidas na rodada 1 e completaram a rodada 2 com 28 de 28 casos do tester e 14 de 14 da referência. O coder devolveu a falta da assinatura no contexto recebido pelo servidor, e a conversa principal repassou a assinatura do pedido antes da entrega.

## Limites do modo API do CLI do processo

Os testes HTTP locais cobrem modelo inexistente, catálogo, configuração explícita, formato JSON recusado e chamadas simultâneas de coder e tester. Eles não chamam o Gemini real. Depois dos ensaios de hosts, o fluxo API foi executado com uma chave do AI Studio: a base chegou aos testes e à reprovação esperada do gate, e uma cópia ajustada terminou aprovada. Os detalhes e os limites dessa validação estão no [relato específico](../2026-10-15-cli-api). O alias padrão e um modelo substituto listado não garantem gratuidade ou cota da conta. Os modos `demonstracao` e `manual` continuam como caminhos sem exigir assinatura paga.

## Reproduzir

Siga as partes [2](../../docs/tutorial/02-servidor-mcp.md), [4](../../docs/tutorial/04-skills.md), [5](../../docs/tutorial/05-subagents.md) e [6](../../docs/tutorial/06-integrado.md). Comece com `respostas.md` vazio, responda às dúvidas e execute o processo novamente. Confira os arquivos de `saida/` e rode `node ../comum/testar.mjs` no terminal da demonstração.

Para repetir uma conferência cruzada sem modelo, copie os arquivos de uma rodada para uma pasta nova: mantenha seus casos e troque apenas o código pela referência, depois faça o inverso. Rode `demonstracoes/comum/testar.mjs` apontando para cada pasta, como na [parte 1 do tutorial](../../docs/tutorial/01-testes-de-referencia.md). Não sobrescreva os artefatos originais.

As transcrições são extratos sanitizados. Comandos e resultados longos são truncados explicitamente. Os logs completos originais permanecem locais; eles incluem detalhes de execução e não fazem parte do material distribuído.
