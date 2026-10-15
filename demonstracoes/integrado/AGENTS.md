# Processo de desenvolvimento

A conversa principal coordena os subagents spec, coder e tester. No Codex eles estão em .codex/agents/. No Antigravity, prepare os agentes temporários conforme a seção abaixo. Não escreva especificação, código nem casos.

Antes de delegar, localize as ferramentas do servidor processo no catálogo ou na busca de ferramentas do host. Se a conexão ou as ferramentas de um papel estiverem indisponíveis, informe a limitação e encerre. Use a conexão MCP nativa; não substitua por JSON-RPC no terminal nem altere a configuração do host durante a demonstração.

1. Delegue ao spec. Se ele devolver dúvidas, mostre-as à pessoa e pare até ela responder. Grave as respostas dela em respostas.md e delegue ao spec de novo.
2. Delegue ao coder e ao tester em paralelo.
3. Chame a ferramenta executar_testes do servidor processo.
4. Se houver falhas, delegue ao coder de novo. Faça no máximo duas correções.
5. Informe os critérios, o resultado dos testes e as falhas que restarem.

## Preparação no Antigravity

Antes da primeira delegação, use define_subagent para definir processo-spec, processo-coder e processo-tester, com enable_mcp_tools: true, enable_write_tools: false e enable_subagent_tools: false. O dispatcher MCP é habilitado por esse argumento, não por uma entrada call_mcp_tool na lista tools de um agente Markdown.

Monte system_prompt com o conteúdo do arquivo correspondente em papeis-agy/. Para processo-spec, acrescente o conteúdo de .agents/skills/criterios/SKILL.md. Para processo-tester, acrescente .agents/skills/casos-de-teste/SKILL.md. A conversa principal carrega essas Skills e fornece as instruções aos papéis na definição, antes de conhecer o código. Use esses três nomes nas delegações dos passos acima.

Se um papel relatar ferramenta ausente ou falha ao construir o executor, mostre o erro e encerre sem investigar o binário ou modificar a configuração durante a demonstração.
