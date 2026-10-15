# Antes de executar

[Voltar ao índice](README.md)

O laboratório mostra como dividir uma mudança de software entre agentes. O exemplo é uma função que filtra tarefas pelo estado e pelo título. Você acompanha o pedido, responde às dúvidas e confere o que cada etapa entregou.

Comece pela parte 1, pois ela roda sem conta de IA. Depois escolha uma demonstração com agente. As partes 2, 4 e 5 apresentam montagens separadas. A parte 6 combina as peças. A parte 3 usa um CLI próprio e tem seus cenários.

## O que cada papel entrega

| Papel | O que recebe | O que entrega |
|---|---|---|
| `spec` (especificação) | Pedido e respostas às dúvidas | Critérios de aceitação e dúvidas que ainda faltam resolver |
| `coder` (implementação) | Especificação e falhas de uma tentativa anterior, quando houver | Código da função |
| `tester` (testes) | Especificação | Casos com entrada e resultado esperado |

Um critério de aceitação descreve um comportamento que você consegue conferir. Por exemplo, "o termo REVISAR encontra o título Revisar código". Um caso de teste transforma esse critério numa entrada concreta e numa saída esperada.

Uma Skill guarda instruções que o agente carrega para uma tarefa. Um subagent (subagente) executa uma tarefa numa conversa separada. MCP (Model Context Protocol) conecta o agente a ferramentas, como as cinco operações do servidor deste laboratório. O host é o programa que usa o modelo e conecta essas ferramentas, como `agy`, `codex` ou `claude`.

## O caminho do pedido

O desenho mostra a ordem pretendida do processo. Ele ajuda a ler a execução. A comprovação fica nos arquivos e nas chamadas registradas.

```text
Pedido e respostas
        |
        v
       spec ----- dúvidas abertas ----> pessoa responde
        ^                                    |
        +------------------------------------+
        |
        | especificação sem dúvidas
        +------------------+
        v                  v
      coder              tester
        |                  |
      código             casos
        +--------+---------+
                 v
          script de testes
                 |
        falhou? devolva ao coder
                 |
        testes passaram? confira referência e regras do cenário
```

O paralelismo depende da montagem. Na Skill `processo` compartilhada por Antigravity e Codex, coder e tester são chamados em sequência. Na demonstração de subagents, a conversa principal pede os dois em paralelo. No MCP simples, os três papéis usam a mesma conversa. Portanto, separar o contexto devolvido por uma ferramenta não apaga o histórico do host.

## Como interpretar uma aprovação

O script executa a função com os casos escritos pelo tester. Se o resultado coincide com o esperado, aquele caso passa. Isso ainda permite que spec, coder e tester sigam a mesma decisão errada.

A conferência com a referência acrescenta outra pergunta. O código também atende aos exemplos preparados para as respostas deste laboratório? A referência verifica um conjunto finito de entradas. Outros defeitos podem ficar fora desses casos.

Um gate é uma regra automática para aceitar a entrega. No cenário 2 do CLI, o gate de rastreabilidade confere os identificadores dos critérios e dos casos. Uma implementação pode passar nos testes de comportamento e reprovar nesse gate.

No script comum, "todo critério tem caso" significa que cada ID da especificação aparece nos testes. Isso não mede linhas ou ramos do código. Também não comprova que o teste representa corretamente o texto do critério. Leia os exemplos de entrada e saída para conferir essa relação.

## Conferir código e testes separadamente

Use esta conferência depois de completar uma demonstração. Ela cruza os arquivos produzidos com os arquivos de referência.

```text
Código produzido + casos produzidos  -> concordam entre si?
Código de referência + casos produzidos -> os casos aceitam a referência?
Código produzido + casos de referência -> o código atende à referência?
```

O exemplo abaixo usa a saída da demonstração de Skills. Execute na raiz do repositório, com pastas `checagem-casos` e `checagem-codigo` que ainda não existam. Para outra demonstração, troque somente o caminho `demonstracoes/skills/saida` pela pasta de saída correspondente.

No Linux ou macOS:

```bash
cp -r demonstracoes/skills/saida checagem-casos
cp demonstracoes/comum/exemplo/filtrarTarefas.ts checagem-casos/
node demonstracoes/comum/testar.mjs checagem-casos
cp -r demonstracoes/comum/exemplo checagem-codigo
cp demonstracoes/skills/saida/filtrarTarefas.ts checagem-codigo/
node demonstracoes/comum/testar.mjs checagem-codigo
```

No PowerShell:

```powershell
Copy-Item -Recurse demonstracoes/skills/saida checagem-casos
Copy-Item demonstracoes/comum/exemplo/filtrarTarefas.ts checagem-casos/
node demonstracoes/comum/testar.mjs checagem-casos
Copy-Item -Recurse demonstracoes/comum/exemplo checagem-codigo
Copy-Item demonstracoes/skills/saida/filtrarTarefas.ts checagem-codigo/
node demonstracoes/comum/testar.mjs checagem-codigo
```

Guarde a saída de cada comando e confira seu código de saída. A [parte 1](01-testes-de-referencia.md#como-ler-o-resultado) explica os códigos. As cópias preservam os arquivos originais. Ao terminar, você pode apagar somente as duas pastas de conferência que criou.

Se você respondeu às dúvidas de outra forma, a referência deste repositório pode reprovar uma solução coerente com suas respostas. Antes de chamar isso de defeito, compare a regra escolhida com `respostas-exemplo.md`.

## Fazer seu próprio ensaio

1. Escreva a pergunta antes de começar, como "o spec para quando o pedido permite duas respostas?".
2. Registre a versão do host com `agy --version`, `codex --version` ou `claude --version`. Anote o modelo escolhido e a versão do material com `git rev-parse --short HEAD`.
3. Prepare a primeira rodada com `respostas.md` vazio e `saida/` sem arquivos de uma execução anterior. Confira o caminho antes de apagar uma saída.
4. Execute a demonstração e registre critérios, dúvidas, delegações e arquivos produzidos. Uma mensagem dizendo "deleguei" precisa ser conferida nas chamadas do host.
5. Para a segunda rodada, use as onze respostas do exemplo e uma saída limpa. Mantenha host, modelo e instruções iguais quando a pergunta for sobre o efeito das respostas.
6. Execute os testes e a conferência cruzada. Guarde os resultados mesmo quando houver falha.
7. Ao experimentar outra regra, altere uma condição por vez. Anote exatamente o que mudou e repita a execução em uma pasta separada.

O resultado esperado da primeira rodada é a parada nas dúvidas. Na segunda, confira se as dúvidas foram resolvidas e se o processo chegou aos testes. Se aparecer uma dúvida nova, registre-a e peça uma resposta. A quantidade de critérios e casos pode variar entre execuções do mesmo modelo.

## O que os registros permitem concluir

Os relatos deste laboratório são estudos exploratórios com execuções documentadas. Eles mostram comportamentos observados, falhas e correções nas condições descritas. Cada relato informa a montagem, os resultados, os artefatos e os limites da interpretação.

O conjunto atual não é uma comparação controlada entre modelos. Hosts, instruções, versões e quantidade de casos diferem. Um resultado de 42/42 e outro de 28/28 usam suítes diferentes. Essas contagens não formam um ranking de qualidade. Os relatos também não medem desempenho médio, custo típico ou taxa de falha.

Para avaliar o isolamento do tester, confira as ferramentas que ele podia usar e as chamadas que realizou. Uma instrução pedindo para não ler código depende do comportamento do agente. Uma restrição de ferramenta impede uma operação específica. As partes 4 a 6 explicam essa diferença por host.

Os testes HTTP locais do cliente API usam um servidor falso para provocar erros de forma repetível. O [ensaio com Gemini](../../evidencias/2026-10-15-cli-api) confirma uma integração real. Um teste local de fallback e uma chamada real sem fallback respondem a perguntas diferentes.

## Próximos passos

- Executar a [parte 1](01-testes-de-referencia.md) e introduzir um defeito na cópia da referência.
- Escolher a [parte 2](02-servidor-mcp.md), [4](04-skills.md) ou [5](05-subagents.md) para acompanhar um host.
- Ler os [relatos de execução](../../evidencias/README.md) junto dos arquivos que sustentam cada resultado.
