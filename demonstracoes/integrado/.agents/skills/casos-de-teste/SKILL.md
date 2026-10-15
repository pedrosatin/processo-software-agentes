---
name: casos-de-teste
description: Como escolher casos de teste por partição de equivalência e valor-limite.
---

Para cada critério, divida as entradas em classes que o código trata do mesmo jeito. Escreva um caso por classe.

Acrescente casos nos limites de cada classe: lista vazia, termo vazio, termo só com espaços, termo igual ao título inteiro, estado com maiúscula.

Inclua casos com tarefas fora da ordem de id e com estados misturados, para que um resultado reordenado ou com o estado trocado falhe.
