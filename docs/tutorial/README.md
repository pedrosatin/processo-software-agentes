# Tutorial das demonstrações

Passo a passo para executar cada demonstração deste repositório no laboratório. Todas implementam a mesma função, `filtrarTarefas`, com os papéis spec, coder e tester. As três primeiras partes rodam sem gasto. Elas funcionam sem modelo e sem chave, e o modo `api` do CLI usa a chave gratuita do Google AI Studio. As partes 4 a 6 usam o Claude Code, que é pago, e trazem os registros de execução para quem não tem acesso.

## Ordem sugerida

| Parte | Demonstração | Precisa de modelo | Custo |
|---|---|---|---|
| [1](01-testes-de-referencia.md) | Script de testes e artefatos de referência, em `demonstracoes/comum` | Não | Nenhum |
| [2](02-servidor-mcp.md) | Servidor MCP do processo, em `demonstracoes/mcp-processo` | Não para a conferência. Sim com um host | Nenhum com o Gemini CLI no nível gratuito |
| [3](03-cli-da-atividade.md) | CLI da atividade, em `atividade` | Não nos modos `demonstracao` e `manual`. Sim no modo `api` | Nenhum. O modo `api` usa a chave gratuita do AI Studio |
| [4](04-skills.md) | Skills do Claude Code, em `demonstracoes/skills` | Sim | Claude Code exige plano pago ou crédito de API |
| [5](05-subagents.md) | Subagents do Claude Code, em `demonstracoes/subagents` | Sim | Idem |
| [6](06-integrado.md) | Subagents, Skills e MCP combinados, em `demonstracoes/integrado` | Sim | Idem |

As partes 4, 5 e 6 dependem do Claude Code, que não tem uso gratuito. Sem assinatura, acompanhe essas partes pela execução do professor no projetor ou pelos registros. Cada demonstração que usa modelo foi executada com o Claude Code e o modelo Haiku em 14/10/2026, e o tutorial mostra trechos reais dessas execuções. Os prints com o selo "registro de 14/10/2026" vêm das transcrições. Os demais prints vêm de execuções feitas para este tutorial, com os mesmos comandos indicados no texto.

| Parte | Relato da execução |
|---|---|
| 2, com host | [evidencias/2026-10-14-mcp](../../evidencias/2026-10-14-mcp) |
| 3 | [evidencias/2026-10-14-cli-demonstracao](../../evidencias/2026-10-14-cli-demonstracao) |
| 4 | [evidencias/2026-10-14-skills](../../evidencias/2026-10-14-skills) |
| 5 | [evidencias/2026-10-14-subagents](../../evidencias/2026-10-14-subagents) |
| 6 | [evidencias/2026-10-14-integrado](../../evidencias/2026-10-14-integrado) |

## Preparação

Clone o repositório e entre na pasta:

```bash
git clone https://github.com/pedrosatin/processo-software-agentes.git
cd processo-software-agentes
```

| Ferramenta | Uso | Como conferir |
|---|---|---|
| Docker Desktop | CLI da atividade e, sem Node instalado, os scripts das partes 1 e 2 | `docker --version` |
| Node.js 23.6 ou posterior no host | Scripts das partes 1 e 2 direto no terminal | `node --version` |
| Gemini CLI | Host MCP gratuito da parte 2, opcional | `gemini --version` |

Os comandos deste tutorial usam o terminal na raiz do repositório, exceto na parte 3, que roda dentro da pasta `atividade`. Os comandos de `node` e `docker` funcionam no PowerShell e no terminal do Linux ou do macOS. Quando a sintaxe muda entre eles, o texto mostra as duas formas.

A regra dos 23.6 vale para o Node instalado na máquina. A imagem Docker da parte 3 traz Node 22.23 e também executa esses scripts, porque o TypeScript roda sem etapa de compilação nesse caminho.

## Sem Node na máquina

Se a máquina não tiver Node 23.6 ou posterior, construa a imagem da parte 3 uma vez (`docker compose -p aula-processo build` dentro de `atividade`) e use o Node dela, montando o repositório como volume.

No PowerShell:

```powershell
docker run --rm -v "${PWD}:/repo" -w /repo --entrypoint node aula-processo-agentes:local demonstracoes/comum/testar.mjs demonstracoes/comum/exemplo
```

No Linux ou no macOS:

```bash
docker run --rm -v "$PWD:/repo" -w /repo --entrypoint node aula-processo-agentes:local demonstracoes/comum/testar.mjs demonstracoes/comum/exemplo
```

A imagem traz o Node 22.23, que já executa TypeScript sem compilação. Troque o caminho do script para rodar `demonstracoes/mcp-processo/conferir.mjs` da mesma forma.

## Arquivos gerados

As execuções gravam em `atividade/artefatos/` e em `demonstracoes/*/saida/`. As duas pastas estão no `.gitignore` e não entram em commits. Para recomeçar uma demonstração com Claude Code, apague a pasta `saida/` dela e restaure `respostas.md` com `git checkout -- respostas.md`.
