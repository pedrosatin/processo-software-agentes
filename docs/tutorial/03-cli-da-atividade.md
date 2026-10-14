# Parte 3. CLI da atividade

[Voltar ao índice](README.md)

## O que a demonstração mostra

A pasta [atividade](../../atividade) tem um CLI em TypeScript que executa spec, coder e tester sobre `filtrarTarefas` e avalia o resultado com gates, os critérios de saída de cada cenário. O processo de cada cenário está em `cenarios/<id>/processo.json`, e as instruções dos três agentes estão em `agentes/`.

```text
pedido + entradas/respostas.md
        │
        ▼
      spec ──► spec.json (dúvidas encerram com código 3)
        │
   ┌────┴────┐  em paralelo, o tester sem ver o código
   ▼         ▼
 tester    coder ──► proposta.ts
   │         │
   └────┬────┘
        ▼
 casos do tester x proposta ──► falhas voltam ao coder até limiteCorrecoes
        ▼
 suíte de referência (não volta ao coder)
        ▼
 gates do cenário ──► código 0 aprovado, 1 reprovado
```

O CLI tem três modos de resposta:

| Modo | Origem das respostas dos agentes | Chave |
|---|---|---|
| `demonstracao` | Arquivos gravados em `cenarios/<id>/gravadas/`, padrão | Nenhuma |
| `manual` | Arquivo de resposta que o aluno cria a partir de um chat de modelo | Nenhuma |
| `api` | Endpoint compatível com Chat Completions, por padrão o Gemini | Chave gratuita do Google AI Studio |

## Pré-requisitos

Docker Desktop aberto. Os comandos rodam dentro da pasta `atividade`:

```bash
cd atividade
```

Construa a imagem uma vez. A primeira construção baixa a imagem do Node e instala as dependências.

```bash
docker compose -p aula-processo build
```

A construção termina com a linha `Image aula-processo-agentes:local Built`. O serviço monta `agentes/`, `cenarios/` e `entradas/` só para leitura e grava em `artefatos/`. Alterações nas instruções valem na execução seguinte, sem reconstruir a imagem.

Em Linux com UID diferente de 1000, libere a escrita com `chmod -R a+w artefatos`. Em scripts ou terminais sem TTY, acrescente `-T` depois de `--rm` nos comandos `run`.

## 1. Listar os cenários

```bash
docker compose -p aula-processo run --rm processo cenarios
```

![Tabela com os quatro cenários e seus gates](img/cli-cenarios.png)

As duas linhas `Container ... Creating` e `Created` vêm do Docker Compose e aparecem em todo `run`. Cada cenário muda uma regra do processo:

| Cenário | Regra que o gate cobra |
|---|---|
| `01-correcao-urgente` | A suíte do tester reproduz o defeito do chamado, e a correção altera no máximo quatro linhas |
| `02-rastreabilidade` | Critérios com ID `C1`, `C2`, no máximo cinco, e cada caso cita o ID do critério que verifica |
| `03-padrao-da-equipe` | O código segue o padrão da equipe na primeira tentativa |
| `04-qualidade-dos-testes` | Os cinco casos do tester matam pelo menos seis de sete mutantes |

O README de cada cenário, em `cenarios/<id>/README.md`, descreve a situação e os materiais.

## 2. Executar o cenário 2 no modo demonstração

```bash
docker compose -p aula-processo run --rm processo executar --cenario 2 --rotulo antes
```

![Eventos e tabela-resumo da execução do cenário 2](img/cli-executar-2.png)

### Como ler o resultado

Cada linha JSON é um evento, gravado também em `eventos.jsonl`.

| Evento | Significado |
|---|---|
| `inicio` | Cenário, modo e `versaoAgentes`, o hash das instruções de cada agente |
| `chamada` | Pedido a um agente. Tester e coder aparecem com o mesmo horário porque rodam em paralelo |
| `verificacao` | Placar dos casos do tester contra a proposta do coder |
| `gate` | Resultado de cada gate, com a lista de apontamentos em `detalhes` |
| `fim` | Resumo da execução |

A tabela final resume a execução. Os casos do tester passam (`5/5`), a suíte de referência passa (`7/7`), e mesmo assim o encerramento é `reprovado`. O gate `rastreabilidade` falhou com 21 apontamentos. Os 15 critérios do spec não começam com ID, o spec passou do limite de cinco critérios, e os cinco casos não citam ID. O código está correto, e a entrega reprova por uma regra do processo que nenhum teste de comportamento verifica. A mesma execução está descrita como experimento em [evidencias/2026-10-14-cli-demonstracao](../../evidencias/2026-10-14-cli-demonstracao).

No modo demonstração nenhum modelo é chamado. A coluna `chamadas` conta os pedidos aos agentes, respondidos pelos arquivos de `gravadas/`.

| Código de saída | Encerramento |
|---|---|
| 0 | Tester e gates aprovam |
| 1 | Tester ou algum gate reprova |
| 2 | Erro de uso, como cenário inexistente |
| 3 | O spec registrou dúvidas |

### Os outros cenários

Troque o número em `--cenario`. As gravadas reproduzem a linha de base, e os quatro cenários terminam reprovados por motivos diferentes.

```bash
docker compose -p aula-processo run --rm processo executar --cenario 1 --rotulo antes
```

![Execução do cenário 1 com mudanca-minima reprovado](img/cli-executar-1.png)

No cenário 1, o gate `regressao` aprova porque três casos do tester falham na versão em produção, ou seja, a suíte reproduz o defeito. O gate `mudanca-minima` reprova porque a proposta tem 40 linhas alteradas em relação à versão atual, e o limite é 4.

```bash
docker compose -p aula-processo run --rm processo executar --cenario 3 --rotulo antes
```

![Execução do cenário 3 com duas tentativas do coder](img/cli-executar-3.png)

No cenário 3, a revisão de padrão roda dentro do ciclo. A primeira proposta viola o padrão (`"revisao":{"padrao-codigo":false}`), a violação volta ao coder, e a segunda proposta passa. O gate `tentativas` reprova porque o cenário exige aprovação na primeira proposta. Esse gate vem do parâmetro `maxTentativas` de `processo.json` e por isso não aparece na lista do comando `cenarios`.

```bash
docker compose -p aula-processo run --rm processo executar --cenario 4 --rotulo antes
```

![Execução do cenário 4 com 3 de 7 mutantes mortos](img/cli-executar-4.png)

No cenário 4, os cinco casos do tester passam e matam só 3 dos 7 mutantes. Os quatro sobreviventes (termo vazio, ordem do resultado, alteração da lista recebida e estado `abertas`) indicam as classes de entrada que a suíte não cobre.

## 3. Ver os arquivos da execução

O CLI imprime `Execução gravada em /app/artefatos/...`. Esse é o caminho dentro do contêiner. Na sua máquina, a mesma pasta fica em `atividade/artefatos/<cenário>/<data-hora>-<rótulo>/`.

```bash
ls -R artefatos/02-rastreabilidade/20261014-162718-antes
```

No PowerShell, use `Get-ChildItem -Recurse` no lugar de `ls -R`. Troque o nome da pasta pelo da sua execução.

![Estrutura da pasta de uma execução](img/cli-artefatos.png)

| Arquivo | Conteúdo |
|---|---|
| `configuracao.json` | Cenário, modo, modelo, hash das instruções e `processo.json` usado |
| `agentes/` | Cópia das instruções usadas nesta execução |
| `spec.json`, `casos.json` | Saídas validadas do spec e do tester |
| `tentativa-N/` | Proposta, explicação do coder e resultado da verificação |
| `proposta-final.ts`, `referencia.json` | Código final e resultado da suíte de referência |
| `gates.json`, `resumo.json` | Avaliação dos gates e resumo da execução |
| `eventos.jsonl` | Uma linha JSON por evento |
| `manual/` | Pedidos e respostas do modo manual, vazia nos outros modos |

O `gates.json` traz os apontamentos de cada gate, um por linha, e o `resumo.json` traz os números da tabela:

![Conteúdo de gates.json e resumo.json do cenário 2](img/cli-gates.png)

No cenário 4, o `gates.json` lista os mutantes sobreviventes:

![gates.json do cenário 4 com os mutantes sobreviventes](img/cli-gates-4.png)

A pasta `artefatos/` está no `.gitignore`, exceto o arquivo `.gitkeep`. As execuções ficam só na sua máquina.

## 4. Comparar execuções

```bash
docker compose -p aula-processo run --rm processo comparar --cenario 2
```

![Tabela comparando as execuções do cenário 2](img/cli-comparar-2.png)

O comando lista todas as execuções gravadas na pasta do cenário, em ordem de data, uma linha por `resumo.json`. Execuções anteriores também aparecem. Na imagem, a primeira linha é uma execução anterior com outra versão das instruções do spec (`1a637914`), e as outras duas são execuções com as instruções originais. Depois de alterar instruções e rodar com outro rótulo, a coluna `agentes` mostra o hash novo e as colunas de resultado mostram o efeito da mudança.

## 5. Modo manual

O modo manual troca a chamada ao modelo por arquivos. O CLI grava o pedido de cada agente em `manual/<agente>-<tentativa>-pedido.md` e espera o arquivo `manual/<agente>-<tentativa>-resposta.json`. O aluno cola o pedido num chat de modelo gratuito, como o Gemini ou o chat do Google AI Studio, e salva a resposta JSON com o nome indicado. Cada resposta tem prazo de 20 minutos.

### Executar

Abra dois terminais na pasta `atividade`. No primeiro:

```bash
docker compose -p aula-processo run --rm processo executar --cenario 2 --rotulo manual --modo manual
```

O CLI para no evento `aguardando-resposta` do spec:

![CLI aguardando a resposta do spec](img/cli-manual-aguardando.png)

O caminho `/app/artefatos/...` corresponde a `atividade/artefatos/...` na sua máquina. Abra o pedido no editor:

![Início do arquivo spec-0-pedido.md](img/cli-manual-pedido.png)

O pedido tem a instrução do agente, o formato JSON da resposta e a entrada. Cole o arquivo inteiro no chat. Copie só o JSON da resposta e salve em `spec-0-resposta.json`, na mesma pasta `manual/`. O CLI aceita a resposta com ou sem a cerca de código Markdown. Se o spec devolver dúvidas, a execução termina com código 3. Escreva as respostas em `entradas/respostas.md` e rode de novo.

Com o spec respondido, o CLI grava `tester-0-pedido.md` e `coder-0-pedido.md` ao mesmo tempo e espera as duas respostas. Responda as duas, em qualquer ordem, com os nomes `tester-0-resposta.json` e `coder-0-resposta.json`. Abra um chat novo para cada agente, para que o tester não veja a conversa do coder. Se os casos do tester reprovarem a proposta, o CLI pede `coder-1` com as falhas.

![Execução manual concluída](img/cli-manual-final.png)

Na execução mostrada acima, as três respostas salvas foram cópias dos arquivos de `cenarios/02-rastreabilidade/gravadas/`, para registrar o mecanismo sem chamar modelo. Por isso o resultado coincide com o do modo demonstração. Com respostas de um chat, o resultado depende do que o modelo escrever.

## 6. Modo api, com chave gratuita

Este tutorial não executou o modo `api`. Os passos seguem o [README da atividade](../../atividade/README.md).

1. Crie uma chave no [Google AI Studio](https://aistudio.google.com/apikey) com sua conta Google. O nível gratuito não pede cartão.
2. Crie o arquivo `atividade/.env` com a linha `GEMINI_API_KEY=sua-chave`. O Docker Compose lê esse arquivo, e o `.gitignore` da pasta impede que ele entre em commits.
3. Execute com `--modo api`:

```bash
docker compose -p aula-processo run --rm processo executar --cenario 2 --rotulo api --modo api
```

O modelo padrão é `gemini-flash-lite-latest`. Respostas 429 e 503, de limite ou sobrecarga do nível gratuito, são repetidas após 2, 5 e 10 segundos. O evento `uso` registra os tokens de entrada e saída de cada chamada. Sem a chave, o CLI termina com código 2 e um evento `erro` com a mensagem `MODO=api exige GEMINI_API_KEY ou LLM_API_KEY no ambiente`.

## O que alterar para experimentar

As gravadas valem só para as instruções originais. Depois de alterar `agentes/` ou `processo.json`, use o modo `manual` ou `api`. No modo demonstração, a coluna `agentes` mostra o hash novo, e as respostas continuam as mesmas.

No cenário 2, a política de rastreabilidade existe em `cenarios/02-rastreabilidade/politica-rastreabilidade.md`, e nenhum agente a recebe:

```json
"contexto": {
  "spec": [],
  "coder": [],
  "tester": []
}
```

1. Decida quais agentes precisam da política e acrescente `"politicaDeRastreabilidade"` às listas correspondentes em `processo.json`.
2. Ajuste `agentes/spec.md` e `agentes/tester.md` para que sigam a política recebida.
3. Rode com outro rótulo, no modo `manual` ou `api`, e compare:

```bash
docker compose -p aula-processo run --rm processo executar --cenario 2 --rotulo depois --modo manual
docker compose -p aula-processo run --rm processo comparar --cenario 2
```

Nos outros cenários, a tabela "Materiais" do README de cada um mostra os materiais disponíveis e quem os recebe na linha de base. O procedimento é o mesmo do cenário 2. Decida quem recebe cada material, ajuste as instruções e compare as execuções.

Para conferir o executor depois de mudanças no código do CLI:

```bash
docker compose -p aula-processo run --rm --entrypoint npm processo test
```

O comando roda os nove testes do verificador e dos contratos e termina com `# pass 9`.
