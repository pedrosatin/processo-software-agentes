# Especificação: filtrarTarefas

Assinatura: `filtrarTarefas(tarefas: Tarefa[], filtro: { estado: string, termo?: string }): Tarefa[]`
Tipo: `Tarefa = { id: number, titulo: string, concluida: boolean }`

## Critérios

C01: Com estado `todas` e sem termo, a função devolve todas as tarefas da lista, na mesma ordem.
C02: Com estado `abertas`, a função devolve somente as tarefas com `concluida` igual a `false`.
C03: Com estado `concluidas`, a função devolve somente as tarefas com `concluida` igual a `true`.
C04: Com termo `REVISAR`, a função encontra a tarefa "Revisar código", porque maiúsculas e minúsculas não importam.
C05: Com termo `relatorio`, a função não encontra a tarefa "Relatório", porque acentos contam.
C06: Com termo `  compr  `, a função remove os espaços das pontas e encontra a tarefa "Comprar pão".
C07: Com termo vazio `""`, termo só com espaços `"   "` ou sem termo, a função não filtra pelo título e devolve as tarefas que atendem só ao estado.
C08: Com termo `pão`, a função encontra a tarefa "Comprar pão", porque o termo pode aparecer em qualquer parte do título.
C09: Com termo `strasse`, a função não encontra a tarefa "Straße", porque não há conversão de caracteres como o "ß".
C10: Com termo `revisar  código` (dois espaços entre as palavras), a função não encontra a tarefa "Revisar código", porque espaços entre palavras contam.
C11: Com estado `ABERTAS` ou ` abertas `, a função lança Error com a mensagem "Estado inválido".
C12: Com estado fora da lista, a função lança Error com a mensagem "Estado inválido" mesmo quando a lista de tarefas está vazia.
C13: Com estado `abertas` e termo `pão`, a função devolve somente tarefas abertas cujo título contém "pão".
C14: Com estado válido e lista vazia, a função devolve um array vazio.
C15: Um título com "é" escrito como uma letra seguida de acento combinado não é encontrado por um termo com o "é" já composto, e o contrário também, porque não há normalização Unicode.
C16: O resultado contém os mesmos objetos da lista recebida (mesma referência, sem cópia), e a lista recebida continua igual depois da chamada.

## Dúvidas

Nenhuma dúvida em aberto. As respostas em respostas.md cobrem os casos de termo, estado, ordem, referência dos objetos e normalização.
