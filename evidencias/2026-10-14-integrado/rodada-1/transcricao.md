# Transcrição

Modelo: claude-haiku-5-5

Ferramentas disponíveis: `Task`, `Bash`, `CronCreate`, `CronDelete`, `CronList`, `DesignSync`, `Edit`, `EnterWorktree`, `ExitWorktree`, `ListAgents`, `Monitor`, `NotebookEdit`, `PushNotification`, `Read`, `RemoteTrigger`, `ReportFindings`, `ScheduleWakeup`, `SendMessage`, `ShareOnboardingGuide`, `Skill`, `TaskStop`, `ToolSearch`, `WebFetch`, `WebSearch`, `Workflow`, `Write`

Turnos: 1. Duração: 14 s. Encerramento: success.

**Chamada** `Bash`

```json
{
  "command": "ls -la && cat pedido.md",
  "description": "List project files and read pedido.md"
}
```

**Resultado**

```
total 20
drwxr-xr-x 1 usuario usuario  110 Oct 14 16:45 .
drwxr-xr-x 1 usuario usuario   76 Oct 14 16:45 ..
drwxr-xr-x 1 usuario usuario   24 Oct 14 16:45 .claude
-rw-r--r-- 1 usuario usuario  542 Oct 14 16:45 CLAUDE.md
-rw-r--r-- 1 usuario usuario  148 Oct 14 16:45 .mcp.json
-rw-r--r-- 1 usuario usuario  341 Oct 14 16:45 pedido.md
-rw-r--r-- 1 usuario usuario 1142 Oct 14 16:45 README.md
-rw-r--r-- 1 usuario usuario  130 Oct 14 16:45 respostas.md
# Pedido

O suporte pediu uma busca na API de tarefas: filtrar tarefas por estado e por termo no título.

Tipo existente: `Tarefa = { id: number, titulo: string, concluida: boolean }`

Assinatura: `filtrarTarefas(tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[]`

Estados aceitos: `todas`, `abertas` e `concluidas`.
```

**Chamada** `Bash`

```json
{
  "command": "cat respostas.md && echo ---- && cat README.md && echo ---- && cat .mcp.json",
  "description": "Read respostas.md, README.md and .mcp.json"
}
```

**Resultado**

```
# Respostas às dúvidas

Respostas da pessoa responsável pelo pedido. Cada resposta vale para as próximas execuções do spec.
----
# Exemplo integrado

Combina as formas mostradas nas outras pastas:

| Peça | Arquivo | Função |
|---|---|---|
| Subagents | `.claude/agents/` | Um papel por agente, com contexto próprio |
| Skills | `.claude/skills/` | Conhecimento carregado no agente, pelo campo `skills` |
| MCP | `.mcp.json`, `../mcp-processo/server.mjs` | Ordem das etapas, contexto de cada papel e gravação dos artefatos |
| Script de testes | `../comum/testar.mjs` | Verificação executada pelo servidor |
| `CLAUDE.md` | `CLAUDE.md` | Processo seguido pela conversa principal |

Cada subagent só tem as ferramentas do servidor que o papel usa. O tester não tem `Read` e recebe o contexto só por `iniciar_etapa`, que devolve a especificação sem o código.

## Executar

Na pasta desta demonstração, abra o Claude Code, aprove o servidor `processo` e peça:

```text
Execute o processo de desenvolvimento para pedido.md.
```

Para pular as dúvidas, copie `../comum/respostas-exemplo.md` sobre `respostas.md`. A mesma execução roda sem interação com `claude -p "Execute o processo de desenvolvimento para pedido.md."`.

Requer Node 23.6 ou posterior.
----
{
  "mcpServers": {
    "processo": {
      "type": "stdio",
      "command": "node",
      "args": ["../mcp-processo/server.mjs", "."]
    }
  }
}
```

**Chamada** `Agent`

```json
{
  "subagent_type": "spec",
  "description": "Escrever especificação do pedido",
  "prompt": "Você é o agente spec deste processo. Pasta de trabalho: .\n\nPedido (arquivo pedido.md nesta pasta): o suporte pediu uma busca na API de tarefas, filtrando tarefas por estado e por termo no título.\n- Tipo existente: `Tarefa = { id: number, titulo: string, concluida: boolean }`\n- Assinatura: `filtrarTarefas(tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[]`\n- Estados aceitos: `todas`, `abertas` e `concluidas`.\n\nRespostas já dadas pela pessoa responsável estão em respostas.md nesta pasta (leia-o antes de começar). README.md descreve o exemplo.\n\nSiga o fluxo do servidor processo: chame iniciar_etapa e depois entregar_spec com a especificação. Se tiver dúvidas que mudam o resultado, NÃO invente respostas: não entregue a spec; devolva a lista de dúvidas numeradas como sua resposta final, para eu mostrar à pessoa."
}
```

**Resultado**

```
Subagente iniciado em segundo plano.
```

**Modelo**

O agente spec está escrevendo a especificação em segundo plano. Assim que ele terminar, eu sigo o processo: se ele devolver dúvidas, eu as mostro para você e grava suas respostas em `respostas.md`. Se não houver dúvidas, sigo direto para coder e tester em paralelo.

**Chamada (subagente spec)** `mcp__processo__iniciar_etapa`

```json
{
  "papel": "spec"
}
```

**Resultado (subagente spec)**

```
{
  "papel": "spec",
  "instrucao": "Escreva critérios de aceitação com ID sequencial (C01, C02...). Cada critério é uma frase com entrada e resultado esperado, na linguagem de quem fez o pedido. Liste como dúvida cada entrada válida para a qual o pedido e as respostas permitem dois resultados. Entrada fora do tipo declarado, como termo null, não gera dúvida. Não repita dúvidas respondidas e não escolha respostas. Entregue com entregar_spec.",
  "contexto": {
    "pedido": "# Pedido\n\nO suporte pediu uma busca na API de tarefas: filtrar tarefas por estado e por termo no título.\n\nTipo existente: `Tarefa = { id: number, titulo: string, concluida: boolean }`\n\nAssinatura: `filtrarTarefas(tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[]`\n\nEstados aceitos: `todas`, `abertas` e `concluidas`.\n",
    "respostas": "# Respostas às dúvidas\n\nRespostas da pessoa responsável pelo pedido. Cada resposta vale para as próximas execuções do spec.\n"
  }
}
```

**Modelo (subagente spec)**

Não entreguei a especificação. Há dúvidas que mudam o resultado, e não quero escolher as respostas por vocês.

O arquivo respostas.md, conforme recebido pelo servidor processo, não tem nenhuma resposta ainda (só o cabeçalho). Por isso, todas as dúvidas abaixo continuam abertas. Não consegui abrir README.md diretamente, porque minhas ferramentas só cobrem o servidor processo.

Dúvidas:

1. **Estado fora dos aceitos.** Entrada: `filtrarTarefas(tarefas, { estado: "pendentes" })`. O resultado deve ser um erro, ou uma lista vazia?
2. **Estado com maiúsculas.** Entrada: `filtrarTarefas(tarefas, { estado: "ABERTAS" })`. Deve ser aceito como `abertas`, ou tratado como estado inválido (erro ou lista vazia)?
3. **Termo sem distinguir maiúsculas.** Entrada: `termo: "REVISAR"` com a tarefa "Revisar código". A tarefa deve ser encontrada, ou não?
4. **Termo sem acento.** Entrada: `termo: "codigo"` com a tarefa "Revisar código". A tarefa deve ser encontrada, ou não?
5. **Termo parcial.** Entrada: `termo: "Rev"` com a tarefa "Revisar código". A tarefa deve ser encontrada (o termo está contido no título), ou só deve casar com palavra inteira?
6. **Termo só com espaços.** Entrada: `termo: "  "`. Deve ser ignorado (retorna todas as tarefas do estado), ou usado como texto literal (só casa títulos que contenham dois espaços)?
7. **Espaços nas bordas do termo.** Entrada: `termo: " revisar "` com a tarefa "Revisar código". Os espaços das bordas devem ser removidos antes da busca, ou fazem parte do texto buscado?

Assim que a pessoa responsável responder, gravo as respostas em respostas.md e delego ao spec de novo.

**Modelo**

O agente spec não entregou a especificação porque tem sete dúvidas que mudam o resultado. Preciso das suas respostas antes de seguir. Para cada uma, sugeri um padrão que pode aceitar com um "ok".

1. **Estado fora dos aceitos.** `filtrarTarefas(tarefas, { estado: "pendentes" })` deve lançar erro ou devolver lista vazia? *(Sugestão: erro.)*
2. **Estado com maiúsculas.** `{ estado: "ABERTAS" }` deve ser aceito como `abertas`, ou tratado como inválido? *(Sugestão: inválido, com erro.)*
3. **Termo sem distinguir maiúsculas.** `termo: "REVISAR"` deve encontrar "Revisar código"? *(Sugestão: sim.)*
4. **Termo sem acento.** `termo: "codigo"` deve encontrar "Revisar código"? *(Sugestão: não, a comparação acentuada é literal.)*
5. **Termo parcial.** `termo: "Rev"` deve encontrar "Revisar código", ou só palavra inteira? *(Sugestão: sim, basta o termo estar contido no título.)*
6. **Termo só com espaços.** `termo: "  "` deve ser ignorado e devolver todas as tarefas do estado? *(Sugestão: sim.)*
7. **Espaços nas bordas.** `termo: " revisar "` deve ter os espaços removidos antes da busca? *(Sugestão: sim.)*

Quando você responder, gravo as respostas em `respostas.md` e delego ao spec de novo. Se quiser aceitar todas as sugestões, basta dizer "usar as sugestões".
