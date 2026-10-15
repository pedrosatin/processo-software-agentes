# Especificação

## Critérios

C01. Para tarefas [{id:1,titulo:'Revisar código',concluida:false},{id:2,titulo:'Enviar relatório',concluida:true}] e filtro {estado:'todas'} sem termo, o resultado contém as tarefas 1 e 2.
C02. Para tarefas [{id:1,titulo:'Revisar código',concluida:false},{id:2,titulo:'Enviar relatório',concluida:true}] e filtro {estado:'abertas'} sem termo, o resultado contém somente a tarefa 1.
C03. Para tarefas [{id:1,titulo:'Revisar código',concluida:false},{id:2,titulo:'Enviar relatório',concluida:true}] e filtro {estado:'concluidas'} sem termo, o resultado contém somente a tarefa 2.
C04. Para uma lista de tarefas vazia e filtro {estado:'todas'} sem termo, o resultado é uma lista vazia.

## Dúvidas

- Para título 'Revisar código' e termo 'Revisar', a busca deve encontrar trechos do título ou exigir o título inteiro?
- Para título 'Revisar código' e termo 'REVISAR CÓDIGO', a tarefa deve ser encontrada, ignorando maiúsculas e minúsculas?
- Para título 'Revisar código' e termo 'Revisar codigo', a tarefa deve ser encontrada, ignorando acentos?
- Para título 'Revisar código' e termo ' Revisar código ', os espaços nas pontas do termo devem ser removidos antes da busca?
- Para termo '' ou composto somente de espaços, deve-se ignorar o filtro por termo ou aplicar alguma outra regra?
- Com estado 'abertas' e termo 'Enviar relatório', uma tarefa concluída com esse título deve ser excluída por exigir os dois filtros, ou incluída por corresponder ao termo?
- Para estado desconhecido, como 'arquivadas', ou variações como 'ABERTAS' e ' abertas ', qual deve ser o resultado? Se houver erro, qual mensagem deve ser usada?
- Para tarefas correspondentes recebidas na ordem [2,1], o resultado deve manter essa ordem ou usar outra ordenação?
- A função deve preservar a lista original e os objetos de tarefa recebidos, sem modificá-los?
