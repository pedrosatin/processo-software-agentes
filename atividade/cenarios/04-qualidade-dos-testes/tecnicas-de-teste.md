# Técnicas de projeto de casos de teste

Partição de equivalência divide as entradas em classes que o código deve tratar da mesma forma. Um caso por classe cobre a classe inteira. Para filtrarTarefas, as classes vêm de cada estado aceito, do estado inválido e das formas do termo.

Análise de valor-limite escolhe entradas na fronteira de cada classe. Para um termo de texto, a fronteira inclui termo ausente, termo vazio, termo só com espaços, espaços nas pontas e letras em caixa diferente do título.

Propriedades da saída também são testáveis. Uma lista de entrada fora da ordem de id revela ordenação indevida. Comparar a lista recebida antes e depois da chamada revela alteração da entrada.

Um caso pode verificar mais de uma classe ao mesmo tempo, desde que o resultado esperado identifique qual comportamento falhou.
