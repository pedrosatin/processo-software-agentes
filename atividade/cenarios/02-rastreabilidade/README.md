# Cenário 2. Rastreabilidade entre critérios e testes

## Situação

O cliente audita cada entrega e exige ligar cada critério de aceite a um caso de teste e a um resultado. A política está em `politica-rastreabilidade.md`.

## Regras do processo

1. Cada critério do spec começa com um ID `C1`, `C2`, sem repetição.
2. O spec tem no máximo cinco critérios.
3. O campo `criterio` de cada caso começa com o ID que o caso verifica.
4. Todo critério tem pelo menos um caso.
5. Os casos do tester e a suíte de referência aprovam a proposta.

## Materiais

| Material | Conteúdo | Na base, recebido por |
|---|---|---|
| `politicaDeRastreabilidade` | Conteúdo de `politica-rastreabilidade.md` | ninguém |

## Gate

`rastreabilidade` lê o ID no início de cada critério e de cada caso. Reprova critério sem ID, ID repetido, mais de cinco critérios, caso sem ID válido e critério sem caso.
