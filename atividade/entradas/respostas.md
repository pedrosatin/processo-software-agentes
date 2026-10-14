Respostas da pessoa responsável pelo pedido às dúvidas registradas pelo spec.

1. Acentos e diacríticos são comparados como chegam. O termo "relatorio" não encontra "Relatório".
2. Não há normalização Unicode do título nem do termo.
3. Espaços internos do termo são mantidos. Só os espaços nas pontas são removidos.
4. Termo ausente equivale a termo vazio e não filtra.
5. O estado é comparado exatamente. "Abertas" e " abertas" são estados inválidos.
6. Não há ordenação secundária. O resultado segue a ordem da lista recebida.
7. Tarefas com o mesmo título ou o mesmo id são mantidas como chegam.
8. Espaços nas pontas seguem String.prototype.trim do JavaScript, que remove espaço, tabulação, quebra de linha e espaço não separável.
9. Maiúsculas e minúsculas são comparadas com toLowerCase(), sem locale.
10. O termo corresponde a qualquer trecho do título, usando includes() após a conversão de caixa. O termo "compr" encontra "Comprar pão".
11. Os objetos devolvidos podem ser os próprios objetos da entrada ou cópias com os mesmos valores. A comparação dos resultados considera os valores, sem exigir identidade por referência dos objetos.
