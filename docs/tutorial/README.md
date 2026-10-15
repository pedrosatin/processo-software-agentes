# Tutorial das demonstrações

Passo a passo para executar cada demonstração deste repositório no laboratório. Todas implementam `filtrarTarefas`, com os papéis spec, coder e tester. As partes 1 e 3 têm caminhos sem modelo: testes de referência e modo `demonstracao`. O modo `manual` aceita respostas produzidas em um chat com acesso gratuito. O modo `api` depende da cota e do modelo disponíveis na conta do Google AI Studio. As demais partes usam um agente de código:

| Agente | Comando | Custo | Arquivos que lê na pasta |
|---|---|---|---|
| Antigravity CLI | `agy` | Plano Individual gratuito, com limite semanal de uso | `AGENTS.md`, `.agents/skills/`, `.agents/agents/`, `.agents/mcp_config.json` |
| Codex CLI | `codex` | Disponibilidade e limites conforme a conta do ChatGPT; confira antes de começar | `AGENTS.md`, `.agents/skills/`, `.codex/agents/`, `.codex/config.toml` |
| Claude Code | `claude` | Plano pago ou crédito de API | `CLAUDE.md`, `.claude/skills/`, `.claude/agents/`, `.mcp.json` |

O Antigravity é o caminho sem custo. O Antigravity e o Codex leem o mesmo `AGENTS.md` e a mesma pasta `.agents/skills/`. Os subagents e a configuração MCP variam por ferramenta. No integrado do Antigravity, a conversa principal cria agentes temporários com as orientações de `papeis-agy/` e incorpora o conteúdo das Skills, como explica a parte 6.

Leia [Antes de executar](00-como-estudar.md) para entender os papéis, o fluxo, a conferência cruzada e os limites dos ensaios.

## Ordem sugerida

| Parte | Demonstração | Precisa de modelo |
|---|---|---|
| [1](01-testes-de-referencia.md) | Script de testes e artefatos de referência, em `demonstracoes/comum` | Não |
| [2](02-servidor-mcp.md) | Servidor MCP do processo, em `demonstracoes/mcp-processo` | Não para a conferência. Sim com um agente |
| [3](03-cli.md) | CLI do processo, em `demonstracoes/cli` | Não nos modos `demonstracao` e `manual`. Sim no modo `api`, conforme acesso e cota da conta |
| [4](04-skills.md) | Skills, em `demonstracoes/skills` | Sim |
| [5](05-subagents.md) | Subagents, em `demonstracoes/subagents` | Sim |
| [6](06-integrado.md) | Subagents, Skills e MCP combinados, em `demonstracoes/integrado` | Sim |

Os registros de Claude Code com Haiku são de 14/10/2026. Os ensaios de Antigravity e Codex, seus resultados e limites estão no [relato de 15/10](../../evidencias/2026-10-15-agy-codex). Os prints antigos continuam identificados como registros de 14/10 e representam aquela ferramenta e execução. A contagem de casos pode mudar em uma nova execução.

| Parte | Relatos das execuções |
|---|---|
| 2, com agente | [Claude Code](../../evidencias/2026-10-14-mcp), [Antigravity e Codex](../../evidencias/2026-10-15-agy-codex) |
| 3 | [Modo demonstração](../../evidencias/2026-10-14-cli-demonstracao), [Gemini API real](../../evidencias/2026-10-15-cli-api) |
| 4 | [Claude Code](../../evidencias/2026-10-14-skills), [Antigravity e Codex](../../evidencias/2026-10-15-agy-codex) |
| 5 | [Claude Code](../../evidencias/2026-10-14-subagents), [Antigravity e Codex](../../evidencias/2026-10-15-agy-codex) |
| 6 | [Claude Code](../../evidencias/2026-10-14-integrado), [Antigravity e Codex](../../evidencias/2026-10-15-agy-codex) |

A [conferência de formatos e práticas](07-padroes-e-limites.md) relaciona os exemplos às especificações oficiais e explica as simplificações do laboratório.

## Preparação

Clone o repositório e entre na pasta:

```bash
git clone https://github.com/pedrosatin/processo-software-agentes.git
cd processo-software-agentes
```

| Ferramenta | Uso | Como conferir |
|---|---|---|
| Docker Desktop | CLI do processo e, sem Node instalado, os scripts das partes 1 e 2 | `docker --version` |
| Node.js 23.6 ou posterior no host | Agentes das partes 2, 4, 5 e 6 e scripts direto no terminal | `node --version` |
| Antigravity CLI | Agente das partes 2, 4, 5 e 6, sem custo | `agy --version` |
| Codex CLI | Alternativa ao Antigravity, opcional | `codex --version` |

Instale o Antigravity CLI pelas instruções de [antigravity.google/docs/cli](https://antigravity.google/docs/cli/) e faça login com a conta Google na primeira execução. O Codex CLI se instala com `npm install -g @openai/codex` e pede login com a conta do ChatGPT. O Codex só aplica a configuração da pasta (`.codex/`) depois que você aceita confiar no repositório, na primeira vez que abre `codex` dentro dele.

Cada parte informa a pasta em que o comando deve rodar. Comece os comandos de entrada na raiz do repositório. Nas partes com agente, entre na pasta da demonstração antes de iniciar o host. A parte 3 roda dentro de `demonstracoes/cli`. Os comandos de `node` e `docker` funcionam no PowerShell e no terminal do Linux ou do macOS. Quando a sintaxe muda entre eles, o texto mostra as duas formas.

A regra dos 23.6 vale para o Node instalado na máquina. O Dockerfile da parte 3 usa a imagem `node:22-alpine`. O ensaio das capturas usou Node 22.23. A versão exata pode mudar quando a imagem é reconstruída, pois a tag não fixa uma revisão.

As configurações MCP incluídas chamam `node` no host. O caminho Docker abaixo cobre os scripts determinísticos; para conectar um agente ao MCP com os arquivos incluídos, instale Node também na máquina.

## Sem Node na máquina

Se a máquina não tiver Node 23.6 ou posterior, construa a imagem da parte 3 uma vez (`docker compose -p aula-processo build` dentro de `demonstracoes/cli`) e use o Node dela, montando o repositório como volume.

No PowerShell:

```powershell
docker run --rm -v "${PWD}:/repo" -w /repo --entrypoint node aula-processo-agentes:local demonstracoes/comum/testar.mjs demonstracoes/comum/exemplo
```

No Linux ou no macOS:

```bash
docker run --rm -v "$PWD:/repo" -w /repo --entrypoint node aula-processo-agentes:local demonstracoes/comum/testar.mjs demonstracoes/comum/exemplo
```

Confira a versão da imagem com `docker run --rm --entrypoint node aula-processo-agentes:local --version`. A revisão Node 22.23 usada nas capturas já executa TypeScript sem compilação. Troque o caminho do script para rodar `demonstracoes/mcp-processo/conferir.mjs` da mesma forma.

## Arquivos gerados

As execuções gravam em `demonstracoes/cli/artefatos/` e em `demonstracoes/*/saida/`. As duas pastas estão no `.gitignore` e não entram em commits. Para recomeçar uma demonstração, apague a pasta `saida/` dela e restaure `respostas.md` com `git checkout -- respostas.md`.

## Fontes e limites de acesso

Documentação consultada em 15/10/2026: [instalação do Antigravity CLI](https://antigravity.google/docs/getting-started?tab=cli), [planos e acesso ao CLI](https://antigravity.google/docs/plans/), [Skills do Antigravity](https://antigravity.google/docs/skills/) e [subagentes do Codex](https://learn.chatgpt.com/docs/agent-configuration/subagents).

O plano Individual do Antigravity oferece uso sem assinatura e cota semanal. Não há garantia de concluir todas as demonstrações dentro da cota de uma conta. Se o limite acabar, acompanhe os registros ou execute o modo `demonstracao` da parte 3. A atividade não exige assinatura paga. Os ensaios usam a conta do professor e não comprovam a cota de uma conta gratuita recém-criada.
