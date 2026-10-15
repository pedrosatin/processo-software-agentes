# Extrato do ensaio integrado interrompido

O host delegou ao spec via invoke_subagent. A mensagem de sistema registrou falha antes de construir o executor do papel:

```text
failed to construct executor: failed to resolve components: unknown component: tool "call_mcp_tool" not found in registry
```

A execução principal foi interrompida durante o diagnóstico. Nenhum teste foi produzido. Os comandos posteriores de investigação do host e os logs integrais permanecem locais.
