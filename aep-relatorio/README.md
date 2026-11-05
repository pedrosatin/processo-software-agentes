# Relatório da Entrega 2 da AEP

Gera, a partir de um CSV com as execuções dos agentes, as tabelas na ordem do modelo da Entrega 2 e os gráficos. Precisa de Node.js 22 ou posterior e não tem dependências.

## Uso

```bash
cp resultados.modelo.csv resultados.csv
# preencher resultados.csv com as execuções reais
node relatorio.mjs
```

Para ver o formato, rode `node relatorio.mjs resultados.exemplo.csv`. Os dados desse arquivo são fictícios e não podem aparecer no relatório.

## Colunas

| Coluna | Conteúdo |
|---|---|
| `agente` | Nome do agente, igual em todas as linhas dele |
| `caso` | Identificador curto do caso |
| `cenario` | Descrição do cenário |
| `tipo` | `tipico` ou `borda` |
| `esperado` | Resultado definido antes da execução |
| `obtido` | Saída real do agente |
| `acertou` | `sim` ou `nao` |
| `fp` | Itens apontados que não existem no caso |
| `fn` | Itens do caso que não foram apontados |
| `tempo_s` | Tempo da execução, em segundos |

O modelo usa ponto e vírgula, que o Excel em português abre em colunas. O script também aceita vírgula como separador, e nesse caso número com vírgula decimal vai entre aspas. Em agente que não aponta itens, deixe `fp` e `fn` vazios. Um caso repetido conta como caso separado, e o script avisa.

## Saídas

`saida/graficos.html` traz as tabelas com as colunas do modelo e os gráficos, e serve para copiar para o Word ou o Google Docs. `saida/tabelas.md` traz as mesmas tabelas em Markdown. A coluna de meta e a linha da métrica própria ficam para a equipe. O script confere o preenchimento do CSV e não comprova que os valores são reais.

O desvio padrão é amostral, com divisão por n menos 1.

## Testes

```bash
node --test relatorio.test.mjs
```
