# Especificação: filtrarTarefas

## Critérios
C01: Filtrar com estado "todas" e sem termo retorna todas as tarefas da lista.
C02: Filtrar com estado "abertas" e sem termo retorna apenas as tarefas não concluídas.
C03: Filtrar com estado "concluidas" e sem termo retorna apenas as tarefas concluídas.
C04: Filtrar com estado "todas" e termo informado retorna apenas as tarefas cujo título contém o termo.
C05: Filtrar combinando estado ("abertas" ou "concluidas") e termo informado retorna apenas as tarefas que atendem a ambos os filtros.
C06: Filtrar tarefas quando nenhuma corresponder aos filtros aplicados retorna uma lista vazia.
C07: Filtrar uma lista vazia de tarefas retorna uma lista vazia.
C08: Filtrar tarefas não modifica a lista original recebida.

## Dúvidas
- Termo com diferença de maiúsculas/minúsculas em relação ao título (ex.: termo "comprar" e título "Comprar pão"): a busca deve ser insensível a maiúsculas/minúsculas (case-insensitive) ou sensível (case-sensitive)?
- Termo como string vazia ou contendo apenas espaços em branco (ex.: "" ou " "): deve ignorar o filtro de termo (retornando todas as tarefas do estado) ou buscar o texto literalmente?
- Estado diferente dos aceitos (ex.: "pendente" ou ""): a função deve lançar um erro ou retornar uma lista vazia?
