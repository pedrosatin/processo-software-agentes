# Exemplos de agentes com avaliação de acerto

Dois agentes de outro tipo que o spec e o coder, cada um numa pasta com agentes nos três harnesses, regras da conversa principal, arquivos de entrada e um `avaliar.mjs` que mede o resultado.

| Pasta | Agente | Entrada | Saída gravada pelo agente |
|---|---|---|---|
| `validacao` | `validador` | 7 arquivos TypeScript em `entradas/` | `saida/<caso>.json` com `agente`, `ok` e `achados` |
| `documentacao` | `documentador` | 4 funções TypeScript em `entradas/` | `saida/<caso>.md` com parâmetros, retorno e erros |

## Executar

Dentro de `exemplos/validacao` ou de `exemplos/documentacao`, abra o harness e peça o processo:

```bash
cd exemplos/validacao
claude    # ou codex, ou agy
```

```text
Execute o processo de validação para os arquivos de entradas/.
```

Na documentação, peça `Execute o processo de documentação para os arquivos de entradas/.` As regras de `AGENTS.md` mandam listar os arquivos, delegar um por vez ao agente e rodar `node avaliar.mjs` no fim. Para repetir, apague a pasta `saida/`.

## O que o avaliador mede

O `avaliar.mjs` compara os achados de cada saída com o esperado em `casos.json` e informa:

| Medida | Significado |
|---|---|
| Casos exatos | Casos em que o agente acertou todos os itens e não acrescentou nenhum |
| Falso positivo | Item que o agente apontou e não existe no caso, como uma regra violada num arquivo correto |
| Falso negativo | Item que existe no caso e o agente não apontou |
| Precisão | Itens corretos divididos por todos os itens que o agente apontou |
| Cobertura | Itens corretos divididos por todos os itens esperados |
| Marca do agente | Texto que o agente grava na saída. Sem ela, o avaliador avisa que a conversa principal pode ter escrito o arquivo. Qualquer pessoa pode escrever a marca, então ela não prova a delegação |

O tempo médio por caso não é medido. Para medir, rode um caso por vez em modo não interativo com `time`, ou leia a duração no registro do harness.

## Ensaio de 04/11

Cada harness delegou ao agente uma vez por arquivo e gravou as saídas. A resposta de um modelo varia a cada execução, então um novo ensaio pode dar números diferentes.

| Harness e modelo | Agente | Casos exatos | Falsos positivos | Falsos negativos |
|---|---|---|---|---|
| Claude Code 2.1.316, `haiku` | validador | 7 de 7 | 0 | 0 |
| Claude Code 2.1.316, `haiku` | documentador | 4 de 4 | 0 | 0 |
| Codex CLI 0.166.0, modelo padrão | validador | 7 de 7 | 0 | 0 |
| Antigravity CLI 1.4.12, modelo padrão | validador | 7 de 7 | 0 | 0 |

Duas coisas apareceram em tentativas anteriores e levaram a ajustes nas regras. Na primeira do documentador no Claude Code, a conversa principal parou antes de delegar, porque o comando `ls` pediu aprovação e o modo não interativo não tinha permissão para ele. Na do validador, ela leu `casos.json`, que guarda as respostas esperadas, e chamou também os agentes `Explore` e `general-purpose` para listar arquivos. As regras agora mandam listar `entradas/*.ts` com a ferramenta de busca de arquivos e proíbem ler `casos.json`. Com elas, a conversa principal do Claude Code fez duas buscas de arquivos, sete delegações ao agente e um `node avaliar.mjs`, sem outras leituras. Em modo interativo, o harness pede as aprovações na tela.

Na tabela, o Claude Code usou o modelo `haiku`, e o Codex e o Antigravity usaram o modelo padrão da conta. Os modelos são diferentes, então a tabela não compara a qualidade dos harnesses. Com 7 casos, 7 de 7 não prova que o agente acerta sempre.

Os ensaios usam as contas do professor e não comprovam a cota de uma conta gratuita nova.

## Experimentos

1. Troque o `esperado` de um caso em `casos.json` por um valor errado e rode `node avaliar.mjs`. O caso vira erro, com falso positivo ou falso negativo.
2. Apague a regra `ponto-e-virgula` das instruções do `validador` e rode de novo. O caso `c2-ponto-virgula` deve virar falso negativo.
3. Acrescente um caso com uma armadilha nova em `entradas/` e em `casos.json` e veja se o agente cai nela.
4. Compare duas versões da `description` do agente e confira se a conversa principal ainda delega.
