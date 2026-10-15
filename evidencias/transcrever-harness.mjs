// Converte eventos públicos de agy e Codex. Logs originais continuam locais.
// Uso: node evidencias/transcrever-harness.mjs stream.jsonl [modelo] [sessao-nativa.jsonl]
import { readFile } from 'node:fs/promises'

const eventos = (await readFile(process.argv[2], 'utf8')).split('\n').filter(l => l.startsWith('{')).map(JSON.parse)
const inicio = eventos.find(e => e.event === 'init')?.init
const agy = Boolean(inicio)
const identificadores = new Map()
const limpar = texto => /# Contexto global|## Git commits \(regra permanente\)|<!-- ai-memory:start -->/.test(String(texto))
  ? 'Saída omitida: a chamada também leu instruções pessoais fora do repositório. Este registro não comprova isolamento completo.'
  : String(texto)
  .replace(/\[([^\]]+)\]\((\.agents\/[^)]+)\)/g, '$1 (`$2`)')
  .replace(/(?:file:\/\/)?\/home\/[^\s"'`<>)}\]]+/g, '<caminho local>')
  .replace(/\/(?:var\/)?tmp\/[^\s"'`<>)}\]]+/g, '<arquivo temporário>')
  .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, id => {
    if (!identificadores.has(id)) identificadores.set(id, `agente-${identificadores.size + 1}`)
    return identificadores.get(id)
  })
const bloco = valor => {
  const texto = limpar(typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2))
  const trecho = texto.length > 4000 ? `${texto.slice(0, 4000)}\n[trecho truncado]` : texto
  // Cercas internas do resultado não devem encerrar o bloco da transcrição.
  const cerca = '`'.repeat(Math.max(3, ...[...trecho.matchAll(/`+/g)].map(m => m[0].length + 1)))
  return `${cerca}\n${trecho}\n${cerca}`
}
const partes = ['# Transcrição', `Host: ${agy ? 'Antigravity CLI' : 'Codex CLI'}. Modelo: ${inicio?.model ?? process.argv[3] ?? 'não informado pelo stream'}.`,
  'Extrato de mensagens finais, comandos, chamadas de ferramentas e delegações. Eventos de raciocínio e metadados de sessão foram omitidos. O stream principal não inclui necessariamente as leituras internas dos subagentes.']
if (!agy && process.argv[4]) {
  const sessao = (await readFile(process.argv[4], 'utf8')).split('\n').filter(l => l.startsWith('{')).map(JSON.parse)
  const delegacoes = sessao.filter(e => e.type === 'response_item' && e.payload?.type === 'function_call' && e.payload?.name === 'spawn_agent')
    .map(e => {
      const argumentos = JSON.parse(e.payload.arguments)
      // O registro nativo pode conter mensagens opacas e IDs internos: exporta só o papel.
      return { papel: argumentos.task_name, tipo: argumentos.agent_type ?? 'padrão' }
    })
  partes.push('Delegações confirmadas no registro nativo (somente nomes dos papéis):', bloco(delegacoes))
}
for (const evento of eventos) {
  if (agy) {
    const passo = evento.step_update
    if (passo?.state === 'DONE' && passo.step_type === 'tool' && passo.tool_info) {
      partes.push(`Ferramenta: ${passo.tool_info.name}`, bloco(passo.tool_info.parameters ?? {}))
      if (passo.tool_info.output) partes.push('Resultado:', bloco(passo.tool_info.output))
    }
    if (passo?.state === 'DONE' && passo.step_type === 'subagent') {
      for (const agente of passo.subagent_info?.subagents ?? []) {
        partes.push(`Delegação: ${agente.type_name ?? 'subagente'}`, bloco(agente.initial_prompt ?? ''))
      }
    }
    if (evento.event === 'result') {
      const { status, response, duration_seconds, num_turns } = evento.result ?? {}
      partes.push('Encerramento:', bloco({ status, response, duration_seconds, num_turns }))
    }
  } else if (evento.type === 'item.completed') {
    const item = evento.item
    if (item?.type === 'agent_message') partes.push('Modelo:', limpar(item.text))
    if (item?.type === 'command_execution') partes.push('Comando:', bloco(item.command), `Saída (código ${item.exit_code}):`, bloco(item.aggregated_output ?? ''))
    if (item?.type === 'mcp_tool_call') partes.push(`MCP: ${item.server}.${item.tool}`, bloco(item.arguments), 'Resultado:', bloco(item.result ?? item.error ?? ''))
    if (item?.type === 'collab_tool_call') {
      partes.push('Subagentes:', bloco({ ferramenta: item.tool, estado: item.status }))
    }
  }
}
console.log(partes.join('\n\n').split('\n').map(linha => linha.trimEnd()).join('\n'))
