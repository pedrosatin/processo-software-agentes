# Processo com o agente validador

O papel validador é um subagent criado nesta pasta. No Antigravity ele fica em .agents/agents/ e no Codex em .codex/agents/. A conversa principal coordena o processo e não faz o trabalho do agente.

1. Liste os arquivos de entradas/*.ts com a ferramenta de busca de arquivos. Para cada um, delegue ao subagent validador. Passe apenas o caminho do arquivo. Uma delegação por arquivo.
2. Quando todas as delegações terminarem, rode o comando `node avaliar.mjs`, sozinho, sem outros comandos na mesma linha.
3. Informe o resultado de avaliar.mjs: casos exatos, falsos positivos e falsos negativos.

Não leia casos.json nem avaliar.mjs. O primeiro guarda as respostas esperadas, e o segundo só deve rodar no fim.

Se o subagent validador não existir, pare e informe qual arquivo falta. Não crie o subagent por conta própria.
