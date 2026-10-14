# Transcrição

Modelo: claude-haiku-5-5

Ferramentas disponíveis: 

Turnos: 3. Duração: 12 s. Encerramento: success.

**Chamada** `mcp__processo__iniciar_etapa`

```json
{
  "papel": "spec"
}
```

**Resultado**

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

**Chamada** `mcp__processo__entregar_spec`

```json
{
  "criterios": [
    {
      "id": "C01",
      "texto": "Dado o estado \"todas\" e nenhum termo, filtrarTarefas devolve todas as tarefas recebidas, na mesma ordem."
    },
    {
      "id": "C02",
      "texto": "Dado o estado \"abertas\" e nenhum termo, filtrarTarefas devolve somente as tarefas com concluida igual a false."
    },
    {
      "id": "C03",
      "texto": "Dado o estado \"concluidas\" e nenhum termo, filtrarTarefas devolve somente as tarefas com concluida igual a true."
    },
    {
      "id": "C04",
      "texto": "Dado um termo que aparece no titulo de algumas tarefas, filtrarTarefas devolve somente as tarefas cujo titulo contém esse termo, respeitando também o estado informado."
    },
    {
      "id": "C05",
      "texto": "Dado um termo que não aparece no titulo de nenhuma tarefa, filtrarTarefas devolve uma lista vazia."
    },
    {
      "id": "C06",
      "texto": "Dada uma lista de tarefas vazia, filtrarTarefas devolve uma lista vazia para qualquer estado aceito."
    },
    {
      "id": "C07",
      "texto": "Dado o filtro sem o campo termo, o titulo não é considerado na filtragem, e o resultado depende apenas do estado."
    }
  ],
  "duvidas": [
    "Ao comparar o termo com o titulo, a busca deve ignorar diferença entre maiúsculas e minúsculas? Por exemplo, o termo \"compra\" encontra a tarefa \"Compra de leite\"?",
    "Ao comparar o termo com o titulo, a busca deve ignorar acentos? Por exemplo, o termo \"acao\" encontra a tarefa \"Ação do mês\"?",
    "Se o termo for uma string vazia \"\", a filtragem deve ser ignorada e devolver todas as tarefas do estado, ou nenhuma tarefa deve casar com ele?",
    "Se o termo tiver espaços no início ou no fim, como \" compra \", esses espaços devem ser removidos antes da comparação?",
    "Se o estado informado for um texto que não está entre \"todas\", \"abertas\" e \"concluidas\", por exemplo \"pendentes\", a função deve lançar um erro ou devolver uma lista vazia?"
  ]
}
```

**Resultado**

```
{
  "estado": "parado",
  "motivo": "Mostre as dúvidas à pessoa responsável pelo pedido. As respostas entram em respostas.md e a etapa spec roda de novo.",
  "duvidas": [
    "Ao comparar o termo com o titulo, a busca deve ignorar diferença entre maiúsculas e minúsculas? Por exemplo, o termo \"compra\" encontra a tarefa \"Compra de leite\"?",
    "Ao comparar o termo com o titulo, a busca deve ignorar acentos? Por exemplo, o termo \"acao\" encontra a tarefa \"Ação do mês\"?",
    "Se o termo for uma string vazia \"\", a filtragem deve ser ignorada e devolver todas as tarefas do estado, ou nenhuma tarefa deve casar com ele?",
    "Se o termo tiver espaços no início ou no fim, como \" compra \", esses espaços devem ser removidos antes da comparação?",
    "Se o estado informado for um texto que não está entre \"todas\", \"abertas\" e \"concluidas\", por exemplo \"pendentes\", a função deve lançar um erro ou devolver uma lista vazia?"
  ]
}
```

**Modelo**

A etapa spec parou com cinco dúvidas, então não vou seguir para coder nem tester. Estas são as dúvidas, para a pessoa responsável pelo pedido:

1. **Maiúsculas e minúsculas:** a busca no título deve ignorar diferença entre maiúsculas e minúsculas? Por exemplo, o termo "compra" encontra "Compra de leite"?
2. **Acentos:** a busca deve ignorar acentos? Por exemplo, "acao" encontra "Ação do mês"?
3. **Termo vazio:** se o termo for `""`, o filtro por título deve ser ignorado e devolver todas as tarefas do estado, ou nenhuma tarefa deve casar?
4. **Espaços nas bordas:** o termo `" compra "` deve ter os espaços removidos antes da comparação?
5. **Estado inválido:** se o estado for um texto fora de `todas`, `abertas` e `concluidas` (por exemplo, `"pendentes"`), a função deve lançar erro ou devolver lista vazia?

Assim que as respostas estiverem em `respostas.md`, posso rodar a etapa spec de novo. Os critérios C01 a C07 já estão registrados e cobrem o comportamento que não depende dessas respostas.
