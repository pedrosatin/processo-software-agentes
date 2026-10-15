# Cenário 3. Padrão de código da equipe

## Situação

O repositório da equipe tem revisão automática de código. O módulo que viola o padrão em `padrao-de-codigo.md` volta para o autor. Neste cenário a revisão roda dentro do ciclo, e cada violação conta como falha enviada ao coder.

## Regras do processo

1. A proposta segue as sete regras de `padrao-de-codigo.md`.
2. A proposta passa na revisão sem gastar tentativas de correção.
3. Os casos do tester e a suíte de referência aprovam a proposta.

## Materiais

| Material | Conteúdo | Na base, recebido por |
|---|---|---|
| `padraoDeCodigo` | Conteúdo de `padrao-de-codigo.md` | ninguém |

## Gate

`padrao-codigo` verifica cada linha de código da proposta: `class`, ponto e vírgula no fim, `let`, `var`, `any`, `for`, `while`, `push`, `splice`, `sort`, `reverse` e o limite de 20 linhas. Está em `revisaoNoCiclo`, então as violações voltam ao coder como falhas, até o limite de duas correções.

`tentativas` exige que a primeira proposta do coder passe no tester e na revisão. Uma correção a mais custa uma chamada ao modelo e o tempo de mais uma verificação.
