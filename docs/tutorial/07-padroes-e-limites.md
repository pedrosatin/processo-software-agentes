# Formatos oficiais e limites dos exemplos

[Voltar ao índice](README.md)

Os exemplos usam formatos documentados pelas ferramentas e práticas de engenharia aplicadas a fluxos com modelos. A conferência abaixo distingue formato, comportamento observado e escolha didática. Ela foi realizada em 15/10/2026.

## MCP no servidor local

O servidor usa JSON-RPC por `stdio`, com uma mensagem JSON por linha. `initialize` informa a versão e as capacidades, e o cliente envia `notifications/initialized` antes das ferramentas. `tools/list` descreve as operações; `tools/call` as executa. Essas estruturas estão nas especificações de [transporte](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports), [ciclo de vida](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle) e [ferramentas MCP](https://modelcontextprotocol.io/specification/2025-11-25/server/tools).

A validação dos argumentos acontece no servidor antes da execução da ferramenta. O [teste de contrato](../../demonstracoes/mcp-processo/contratos.test.mjs) envia oito entradas inválidas, confere o erro `-32602` e verifica a ausência de arquivos gravados. Também envia uma especificação válida. A validação cobre os tipos e restrições presentes nos cinco schemas, como `required`, `enum`, `minItems` e propriedades extras.

Esse é um servidor didático com operações locais. Seu validador não implementa JSON Schema completo. O [conferidor](../../demonstracoes/mcp-processo/conferir.mjs) avalia doze controles do processo e alguns caminhos do protocolo; ele não é uma suíte oficial de conformidade MCP. O servidor aceita apenas o transporte `stdio` e não impõe uma máquina de estados completa para o ciclo de conexão.

## Skills e extensões de cada ferramenta

O formato comum de [Agent Skills](https://agentskills.io/specification) usa uma pasta com `SKILL.md`, metadados YAML e instruções Markdown. As variantes compartilhadas deste repositório seguem esse núcleo, com `name` e `description`.

Claude Code acrescenta recursos próprios, como `context: fork` e `disable-model-invocation`. O campo `allowed-tools` pré-aprova operações; ele não remove as demais ferramentas disponíveis. Esses comportamentos estão na [documentação de Skills do Claude Code](https://code.claude.com/docs/en/skills#pre-approve-tools-for-a-skill). Por isso, os arquivos compartilhados e os arquivos de Claude aparecem em pastas separadas.

## Subagentes e permissões

As definições seguem os caminhos e campos descritos pelos hosts. O [Codex](https://learn.chatgpt.com/docs/agent-configuration/subagents) usa arquivos TOML em `.codex/agents/`. O [Antigravity](https://antigravity.google/docs/subagents/) usa agentes Markdown na demonstração separada. No integrado, o Antigravity usa [define_subagent com MCP habilitado](https://antigravity.google/docs/hooks#agent-collaboration).

As fronteiras de acesso variam entre os hosts. Desligar gravação não impede leitura. Separar a conversa do tester também não basta para restringir arquivos. O [relato de execução](../../evidencias/2026-10-15-agy-codex) descreve as ferramentas e leituras observadas. A aula usa essa diferença para mostrar onde uma regra depende da instrução e onde existe um bloqueio técnico.

## Etapas, testes e correções

O fluxo divide o pedido em etapas e usa o resultado dos testes para orientar correções limitadas. A referência da Anthropic descreve encadeamento de etapas, verificações programáticas e condições de parada em [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents).

A divisão em `spec`, `coder` e `tester` é uma escolha desta aula. O material não demonstra que três papéis sejam sempre necessários ou que superem uma solução com uma chamada. Os testes cobrem comportamentos definidos, e os relatos preservam as falhas encontradas.

Para repetir os ensaios e interpretar seus limites, siga o [guia Antes de executar](00-como-estudar.md). Ele explica como manter as condições entre rodadas e cruzar código e casos com a referência.

## O que permanece específico do laboratório

O MCP local trabalha com arquivos numa pasta de demonstração. Ele tem prazo de execução dos testes e retira as variáveis do servidor do ambiente do filho. O CLI do processo acrescenta restrições do Permission Model do Node. As duas montagens têm controles diferentes, descritos nos respectivos READMEs, e não oferecem a mesma fronteira de execução.

As configurações e os testes publicados permitem estudar esses mecanismos. Uso em outro projeto exige avaliar o acesso a arquivos e serviços, as permissões dos hosts e os limites da conta usada. Os relatos não comprovam segurança para código malicioso, confiabilidade estatística ou custo típico de produção.
