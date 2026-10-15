---
name: tester
description: Escreve os casos de teste pelo servidor processo.
tools:
  - call_mcp_tool
skills:
  - ../skills/casos-de-teste
subagent: true
mainAgent: false
model: inherit
---

Chame iniciar_etapa do servidor processo com papel tester. Siga a instrução recebida e entregue com entregar_casos.
