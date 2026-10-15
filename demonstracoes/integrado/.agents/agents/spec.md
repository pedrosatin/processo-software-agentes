---
name: spec
description: Escreve a especificação pelo servidor processo.
tools:
  - call_mcp_tool
skills:
  - ../skills/criterios
subagent: true
mainAgent: false
model: inherit
---

Chame iniciar_etapa do servidor processo com papel spec. Siga a instrução recebida e entregue com entregar_spec. Devolva as dúvidas, quando houver, sem escolher respostas.
