## Critérios
C01: Ao filtrar com estado "todas" e sem termo, retorna todas as tarefas da lista recebida.
C02: Ao filtrar com estado "abertas", retorna apenas as tarefas com concluida igual a false.
C03: Ao filtrar com estado "concluidas", retorna apenas as tarefas com concluida igual a true.
C04: Ao filtrar com estado diferente de "todas", "abertas" e "concluidas" (comparação exata), lança Error com a mensagem "Estado inválido", mesmo se a lista de tarefas estiver vazia.
C05: Ao filtrar com termo ausente, vazio ou contendo apenas espaços, não filtra por título, retornando as tarefas que atendem ao estado.
C06: Ao filtrar com termo presente em qualquer posição do título, retorna as tarefas correspondentes.
C07: Ao filtrar com termo em maiúsculas ou minúsculas, a busca não diferencia caixa, convertendo título e termo com toLowerCase() sem locale.
C08: Ao filtrar com termo acentuado ou sem acento, a comparação considera acentos e não faz normalização Unicode.
C09: Ao filtrar com termo contendo espaços no início ou no fim, remove os espaços com trim() antes de buscar, mantendo espaços entre palavras.
C10: Ao filtrar com estado e termo juntos, retorna apenas as tarefas que atendem simultaneamente a ambos os critérios.
C11: Ao filtrar tarefas, o resultado mantém a ordem original da lista recebida e não altera a lista original.
C12: Ao filtrar tarefas, retorna sempre um novo array contendo as referências aos mesmos objetos da lista recebida.

## Dúvidas
Nenhuma dúvida em aberto.
