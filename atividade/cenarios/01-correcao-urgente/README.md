# Cenário 1. Correção urgente em produção

## Situação

A versão 1.4.0 de `filtrarTarefas` está em produção, em `versao-atual.ts`. O suporte abriu o chamado 4127: a busca por "revisar" não encontra "Revisar código". A correção sai hoje e a equipe só aceita alterar o necessário para resolver o chamado.

## Regras do processo

1. A suíte do tester reproduz o defeito relatado. Pelo menos um caso falha na versão atual.
2. A correção parte do código atual e altera no máximo quatro linhas.
3. Os casos do tester e a suíte de referência aprovam a correção.

## Materiais

| Material | Conteúdo | Na base, recebido por |
|---|---|---|
| `relatoDoDefeito` | Texto do chamado 4127 | spec |
| `codigoAtual` | Conteúdo de `versao-atual.ts` | ninguém |

## Gates

`regressao` executa os cinco casos do tester na versão atual e exige pelo menos uma falha.

`mudanca-minima` compara a proposta final com a versão atual. Conta linhas removidas mais linhas adicionadas, sem linhas vazias e comentários. O limite é 4.
