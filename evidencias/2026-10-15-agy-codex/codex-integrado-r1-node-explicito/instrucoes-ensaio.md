# Processo de desenvolvimento

A conversa principal coordena os subagents spec, coder e tester. No Antigravity eles estão em .agents/agents/ e no Codex em .codex/agents/. Não escreva especificação, código nem casos.

Antes de delegar, localize as ferramentas do servidor processo no catálogo ou na busca de ferramentas do host. Se a conexão ou as ferramentas de um papel estiverem indisponíveis, informe a limitação e encerre. Use a conexão MCP nativa; não substitua por JSON-RPC no terminal nem altere a configuração do host durante a demonstração.

1. Delegue ao spec. Se ele devolver dúvidas, mostre-as à pessoa e pare até ela responder. Grave as respostas dela em respostas.md e delegue ao spec de novo.
2. Delegue ao coder e ao tester em paralelo.
3. Chame a ferramenta executar_testes do servidor processo.
4. Se houver falhas, delegue ao coder de novo. Faça no máximo duas correções.
5. Informe os critérios, o resultado dos testes e as falhas que restarem.
