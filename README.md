# Processo de software com agentes

Material da aula de Tecnologias Emergentes em Engenharia de Software sobre processo de software com agentes. O mesmo fluxo de trabalho, com os papéis spec, coder e tester, aparece montado em quatro ferramentas: Skills, subagents, um servidor MCP e um CLI.

Todos os exemplos implementam a mesma alteração, a função `filtrarTarefas` de uma API de tarefas:

```typescript
filtrarTarefas(tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[]
```

## Organização

| Pasta | Conteúdo |
|---|---|
| [demonstracoes/skills](demonstracoes/skills) | Uma Skill por papel no Claude Code |
| [demonstracoes/subagents](demonstracoes/subagents) | Um subagent por papel, coordenado pelo `CLAUDE.md` |
| [demonstracoes/mcp-processo](demonstracoes/mcp-processo) | Um servidor MCP que conduz as etapas |
| [atividade](atividade) | Um CLI em TypeScript que chama a API do modelo para cada papel |
| [demonstracoes/integrado](demonstracoes/integrado) | Subagents, Skills e o servidor MCP combinados |
| [demonstracoes/comum](demonstracoes/comum) | Pedido, respostas de exemplo, script de testes e artefatos de referência |
| [evidencias](evidencias) | Relatos de execuções reais, com fluxo observado, resultados e limitações |

Cada pasta tem um README com os comandos. O [tutorial](docs/tutorial/README.md) mostra a execução de cada demonstração passo a passo, com capturas de tela.

## Requisitos

| Uso | Requisito |
|---|---|
| Demonstrações e testes | Node.js 23.6 ou posterior, que executa TypeScript sem compilação |
| Skills, subagents e exemplo integrado | Claude Code |
| Servidor MCP | Claude Code, Gemini CLI ou outro host com MCP |
| CLI da pasta `atividade` | Docker, ou Node.js 22.13 ou posterior, e uma chave gratuita do Google AI Studio |

## Conferir sem modelo

Os comandos abaixo rodam sem chamar nenhum modelo e sem instalar dependências.

```bash
node demonstracoes/comum/testar.mjs demonstracoes/comum/exemplo
node demonstracoes/mcp-processo/conferir.mjs
```

O primeiro executa os casos de teste de referência contra uma implementação de referência. O segundo faz o papel de um host MCP e confere a ordem das etapas no servidor do processo.
