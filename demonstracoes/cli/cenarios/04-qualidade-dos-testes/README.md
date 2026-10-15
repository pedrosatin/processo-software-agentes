# Cenário 4. Qualidade dos testes medida por mutantes

## Situação

Em uma execução anterior, o tester aprovou 5 de 5 casos e a referência reprovou a proposta. Nenhum caso cobria maiúsculas e minúsculas. A equipe passou a medir a suíte do tester com mutantes. A pasta `mutantes/` tem sete versões de `filtrarTarefas`, cada uma com um defeito conhecido.

## Regras do processo

1. Os cinco casos do tester matam pelo menos seis dos sete mutantes.
2. O tester continua sem acesso ao código da proposta e aos mutantes.
3. Os casos do tester e a suíte de referência aprovam a proposta.

## Materiais

| Material | Conteúdo | Na base, recebido por |
|---|---|---|
| `tecnicasDeTeste` | Conteúdo de `tecnicas-de-teste.md` | ninguém |

## Gate

`mutantes` executa os cinco casos do tester em cada mutante. O mutante morre quando algum caso falha. O gate exige seis mortos. Os nomes dos sobreviventes aparecem em `gates.json` e indicam a classe de entrada que a suíte não cobriu.
