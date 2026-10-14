// Converte a saída stream-json do Claude Code em uma transcrição Markdown.
// Mantém mensagens do modelo, chamadas de ferramenta e resultados. Remove o
// identificador da sessão e troca o caminho da pasta de execução por "."
// Uso: node transcrever.mjs stream.jsonl > transcricao.md
import { readFile } from 'node:fs/promises'

const LIMITE = 4000

const eventos = (await readFile(process.argv[2], 'utf8'))
  .split('\n')
  .filter(linha => linha.startsWith('{'))
  .map(linha => JSON.parse(linha))

const inicio = eventos.find(evento => evento.type === 'system' && evento.subtype === 'init')
// Com subagent em segundo plano a conversa principal retoma e gera um resultado por retomada.
// Vale o último resultado, e a duração soma todos
const resultados = eventos.filter(evento => evento.type === 'result')
const fim = resultados.at(-1)
const duracao = resultados.reduce((total, evento) => total + (evento.duration_ms ?? 0), 0)
const pasta = inicio?.cwd ?? ''

// Caminhos fora da pasta de execução viram marcadores. Metadados internos do host somem.
const limpar = texto => {
  let saida = pasta ? texto.replaceAll(pasta, '.') : texto
  saida = saida
    .replace(/\/home\/[^\s"'`)]+/g, '<caminho local>')
    .replace(/\/tmp\/claude-[^\s"'`)]+/g, '<arquivo temporário>')
    .replace(/\/var\/tmp\/[^\s"'`)]+/g, '<arquivo temporário>')
    .replace(/\ba[0-9a-f]{16}\b/g, '<id do subagente>')
  if (/Async agent launched successfully/.test(saida) || (/agentId:/.test(saida) && /output_file:/.test(saida))) {
    return 'Subagente iniciado em segundo plano.'
  }
  saida = saida.replace(
    /\[Subagent hand-back\] The text below is the final report of a subagent this session delegated to\.[\s\S]*?The report follows:\n?/,
    'Relatório do subagente:\n\n'
  )
  return saida
}
const cortar = texto => (texto.length > LIMITE ? `${texto.slice(0, LIMITE)}\n[... ${texto.length - LIMITE} caracteres omitidos]` : texto)
const bloco = (texto, linguagem = '') => `\`\`\`${linguagem}\n${cortar(limpar(texto))}\n\`\`\``
// Chamadas Agent e Skill abrem subagentes. O id da chamada identifica o papel nas mensagens seguintes
const papeis = new Map(eventos
  .filter(evento => evento.type === 'assistant')
  .flatMap(evento => evento.message.content)
  .filter(parte => parte.type === 'tool_use' && ['Agent', 'Task', 'Skill'].includes(parte.name))
  .map(parte => [parte.id, parte.input.subagent_type ?? parte.input.skill ?? parte.name]))
const origem = evento => (evento.parent_tool_use_id ? ` (subagente ${papeis.get(evento.parent_tool_use_id) ?? ''})`.replace(' )', ')') : '')

const textoDoResultado = conteudo => typeof conteudo === 'string'
  ? conteudo
  : conteudo.map(parte => parte.text ?? JSON.stringify(parte)).join('\n')

const formatar = evento => {
  if (evento.type === 'assistant') {
    return evento.message.content.flatMap(parte => {
      if (parte.type === 'text' && parte.text.trim()) return [`**Modelo${origem(evento)}**\n\n${limpar(parte.text.trim())}`]
      if (parte.type === 'tool_use') return [`**Chamada${origem(evento)}** \`${parte.name}\`\n\n${bloco(JSON.stringify(parte.input, null, 2), 'json')}`]
      return []
    })
  }
  if (evento.type === 'user' && Array.isArray(evento.message?.content)) {
    return evento.message.content
      .filter(parte => parte.type === 'tool_result')
      .map(parte => `**Resultado${origem(evento)}**${parte.is_error ? ' (recusa ou erro)' : ''}\n\n${bloco(textoDoResultado(parte.content))}`)
  }
  return []
}

const cabecalho = [
  '# Transcrição',
  `Modelo: ${inicio?.model ?? 'não informado'}`,
  // Conectores MCP da conta de quem executou ficam de fora da lista
  `Ferramentas disponíveis: ${(inicio?.tools ?? []).filter(nome => !nome.startsWith('mcp__')).map(nome => `\`${nome}\``).join(', ')}`,
  fim ? `Turnos: ${fim.num_turns}. Duração: ${Math.round(duracao / 1000)} s. Encerramento: ${fim.subtype}.` : 'Execução sem evento de encerramento.'
].join('\n\n')

console.log([cabecalho, ...eventos.flatMap(formatar)].join('\n\n'))
