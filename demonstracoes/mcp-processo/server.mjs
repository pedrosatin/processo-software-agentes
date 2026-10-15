// Servidor MCP por stdio que conduz o processo spec, coder e tester.
// O modelo do host escreve os artefatos. O servidor entrega a instrução e o
// contexto de cada papel, grava os artefatos em saida/ e recusa etapas fora de ordem.
// Uso: node server.mjs [pasta do projeto]
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

const raiz = resolve(process.argv[2] ?? '.')
const saida = join(raiz, 'saida')
const scriptDeTestes = fileURLToPath(new URL('../comum/testar.mjs', import.meta.url))
const versoesDoProtocolo = ['2025-11-25', '2025-06-18', '2025-03-26']

// Instrução de cada papel, entregue ao modelo junto com o contexto da etapa
const instrucoes = {
  spec: [
    'Escreva critérios de aceitação com ID sequencial (C01, C02...).',
    'Cada critério é uma frase com entrada e resultado esperado, na linguagem de quem fez o pedido.',
    'Liste como dúvida cada entrada válida para a qual o pedido e as respostas permitem dois resultados.',
    'Entrada fora do tipo declarado, como termo null, não gera dúvida.',
    'Não repita dúvidas respondidas e não escolha respostas. Entregue com entregar_spec.'
  ].join(' '),
  coder: [
    'Escreva um módulo TypeScript que exporte filtrarTarefas e o tipo Tarefa,',
    'com funções puras, sem classes, sem imports e sem ponto e vírgula.',
    'Corrija cada falha listada, quando houver. Entregue com entregar_codigo.'
  ].join(' '),
  tester: [
    'Escreva pelo menos um caso por critério, a partir só da especificação.',
    'Cada caso tem nome, criterio, tarefas, filtro e esperadoIds ou esperadoErro.',
    'Entregue com entregar_casos.'
  ].join(' ')
}

// Resultados de ferramenta no formato MCP. Recusas usam isError para o modelo ler o motivo
const texto = (valor, erro = false) => ({
  content: [{ type: 'text', text: typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2) }],
  isError: erro
})
const recusa = mensagem => texto(mensagem, true)

const lerArquivo = async caminho => existsSync(caminho) ? await readFile(caminho, 'utf8') : ''

const lerSpec = async () => {
  const conteudo = await lerArquivo(join(saida, 'spec.json'))
  return conteudo === '' ? null : JSON.parse(conteudo)
}

const specAprovada = spec => spec !== null && spec.duvidas.length === 0

// O tester recebe só a especificação. O coder recebe também as falhas dos testes
const contextoDoPapel = async papel => {
  if (papel === 'spec') {
    return {
      pedido: await lerArquivo(join(raiz, 'pedido.md')),
      respostas: await lerArquivo(join(raiz, 'respostas.md'))
    }
  }
  const especificacao = await lerArquivo(join(saida, 'spec.md'))
  if (papel === 'tester') return { especificacao }
  return { especificacao, falhas: await lerArquivo(join(saida, 'falhas.txt')) }
}

const iniciarEtapa = async ({ papel }) => {
  if (!(papel in instrucoes)) return recusa('Papel desconhecido.')
  if (papel !== 'spec' && !specAprovada(await lerSpec()))
    return recusa('A especificação ainda não foi aprovada.')
  return texto({
    papel,
    instrucao: instrucoes[papel],
    contexto: await contextoDoPapel(papel)
  })
}

const formatarSpec = ({ criterios, duvidas }) => [
  '# Especificação',
  '',
  '## Critérios',
  '',
  ...criterios.map(criterio => `${criterio.id}. ${criterio.texto}`),
  '',
  '## Dúvidas',
  '',
  ...(duvidas.length > 0 ? duvidas.map(duvida => `- ${duvida}`) : ['Nenhuma.']),
  ''
].join('\n')

const entregarSpec = async ({ criterios, duvidas }) => {
  const esperados = criterios.map((_, indice) => `C${String(indice + 1).padStart(2, '0')}`)
  const recebidos = criterios.map(criterio => criterio.id)
  if (recebidos.join() !== esperados.join()) {
    return recusa(`Os IDs precisam ser sequenciais: ${esperados.join(', ')}.`)
  }
  await mkdir(saida, { recursive: true })
  await writeFile(join(saida, 'spec.json'), JSON.stringify({ criterios, duvidas }, null, 2))
  await writeFile(join(saida, 'spec.md'), formatarSpec({ criterios, duvidas }))
  if (duvidas.length > 0) {
    return texto({
      estado: 'parado',
      motivo: 'Mostre as dúvidas à pessoa responsável pelo pedido. As respostas entram em respostas.md e a etapa spec roda de novo.',
      duvidas
    })
  }
  return texto({ estado: 'aprovado', proximas: ['coder', 'tester'] })
}

const entregarCodigo = async ({ codigo }) => {
  if (!specAprovada(await lerSpec())) return recusa('Código recusado. A especificação ainda não foi aprovada.')
  await writeFile(join(saida, 'filtrarTarefas.ts'), codigo)
  return texto({ estado: 'gravado', arquivo: 'saida/filtrarTarefas.ts' })
}

const entregarCasos = async ({ casos }) => {
  const spec = await lerSpec()
  if (!specAprovada(spec)) return recusa('Casos recusados. A especificação ainda não foi aprovada.')
  const ids = new Set(spec.criterios.map(criterio => criterio.id))
  const foraDaSpec = casos.filter(caso => !ids.has(caso.criterio)).map(caso => caso.nome)
  if (foraDaSpec.length > 0) {
    return recusa(`Casos com critério fora da especificação: ${foraDaSpec.join(', ')}.`)
  }
  await writeFile(join(saida, 'casos.json'), JSON.stringify(casos, null, 2))
  return texto({ estado: 'gravado', arquivo: 'saida/casos.json', casos: casos.length })
}

// O código gerado roda em outro processo, com prazo de 10 segundos e sem as variáveis do servidor
const rodarTestes = () => new Promise(resolver => {
  const opcoes = { timeout: 10000, env: { PATH: process.env.PATH } }
  execFile(process.execPath, [scriptDeTestes, saida, '--json'], opcoes, (_erro, stdout, stderr) => {
    try {
      resolver(JSON.parse(stdout))
    } catch {
      resolver({ aprovado: false, erro: stderr.trim() || 'Execução encerrada sem resultado' })
    }
  })
})

const executarTestes = async () => {
  const faltando = ['filtrarTarefas.ts', 'casos.json'].filter(nome => !existsSync(join(saida, nome)))
  if (faltando.length > 0) return recusa(`Faltam os arquivos ${faltando.join(', ')}.`)
  const resultado = await rodarTestes()
  const falhas = (resultado.resultados ?? [])
    .filter(caso => !caso.passou)
    .map(caso => `${caso.criterio} ${caso.nome}: ${caso.detalhe}`)
  if (resultado.erro) falhas.push(resultado.erro)
  // falhas.txt entra no contexto do coder na próxima etapa
  if (resultado.aprovado) await rm(join(saida, 'falhas.txt'), { force: true })
  else await writeFile(join(saida, 'falhas.txt'), falhas.join('\n') + '\n')
  return texto(resultado)
}

// Schemas JSON dos argumentos, enviados ao host em tools/list
const objeto = (properties, required) => ({ type: 'object', properties, required, additionalProperties: false })

const tarefa = objeto(
  { id: { type: 'number' }, titulo: { type: 'string' }, concluida: { type: 'boolean' } },
  ['id', 'titulo', 'concluida']
)

const caso = objeto({
  nome: { type: 'string' },
  criterio: { type: 'string' },
  tarefas: { type: 'array', items: tarefa },
  filtro: objeto({ estado: { type: 'string' }, termo: { type: 'string' } }, ['estado']),
  esperadoIds: { type: 'array', items: { type: 'number' } },
  esperadoErro: { type: 'string' }
}, ['nome', 'criterio', 'tarefas', 'filtro'])

const criterio = objeto({ id: { type: 'string' }, texto: { type: 'string' } }, ['id', 'texto'])

const ferramentas = [
  {
    name: 'iniciar_etapa',
    description: 'Devolve a instrução e o contexto de um papel. Coder e tester exigem especificação aprovada.',
    inputSchema: objeto({ papel: { type: 'string', enum: ['spec', 'coder', 'tester'] } }, ['papel']),
    executar: iniciarEtapa
  },
  {
    name: 'entregar_spec',
    description: 'Grava a especificação. Com dúvidas, o processo para até a pessoa responsável responder.',
    inputSchema: objeto({
      criterios: { type: 'array', minItems: 1, items: criterio },
      duvidas: { type: 'array', items: { type: 'string' } }
    }, ['criterios', 'duvidas']),
    executar: entregarSpec
  },
  {
    name: 'entregar_codigo',
    description: 'Grava saida/filtrarTarefas.ts.',
    inputSchema: objeto({ codigo: { type: 'string' } }, ['codigo']),
    executar: entregarCodigo
  },
  {
    name: 'entregar_casos',
    description: 'Grava saida/casos.json. Cada caso cita um critério da especificação.',
    inputSchema: objeto({ casos: { type: 'array', minItems: 1, items: caso } }, ['casos']),
    executar: entregarCasos
  },
  {
    name: 'executar_testes',
    description: 'Executa os casos contra o código em outro processo e lista critérios sem caso.',
    inputSchema: objeto({}, []),
    executar: executarTestes
  }
]

// Valida o subconjunto de JSON Schema usado pelas cinco ferramentas deste exemplo.
// Não é um validador genérico: novos tipos de schema exigem ampliar esta função.
const validarEntrada = (valor, schema, caminho = 'argumentos') => {
  if (schema.enum && !schema.enum.includes(valor)) return `${caminho}: valor fora da lista permitida.`
  if (schema.type === 'object') {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) return `${caminho}: esperado objeto.`
    for (const nome of schema.required ?? []) {
      if (!Object.hasOwn(valor, nome)) return `${caminho}.${nome}: campo obrigatório.`
    }
    for (const [nome, item] of Object.entries(valor)) {
      if (!Object.hasOwn(schema.properties, nome)) {
        if (schema.additionalProperties === false) return `${caminho}.${nome}: campo não permitido.`
        continue
      }
      const falha = validarEntrada(item, schema.properties[nome], `${caminho}.${nome}`)
      if (falha) return falha
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(valor)) return `${caminho}: esperado array.`
    if (valor.length < (schema.minItems ?? 0)) return `${caminho}: quantidade mínima de ${schema.minItems} item(ns).`
    for (const [indice, item] of valor.entries()) {
      const falha = validarEntrada(item, schema.items, `${caminho}[${indice}]`)
      if (falha) return falha
    }
  } else if (typeof valor !== schema.type || (schema.type === 'number' && !Number.isFinite(valor))) {
    return `${caminho}: esperado ${schema.type}.`
  }
  return null
}

// Protocolo JSON-RPC: uma mensagem por linha na entrada e na saída padrão
const resposta = (id, result) => ({ jsonrpc: '2.0', id, result })
const erro = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } })

const tratar = async ({ id, method, params = {} }) => {
  if (method === 'initialize') {
    const pedida = params.protocolVersion
    const protocolVersion = versoesDoProtocolo.includes(pedida) ? pedida : versoesDoProtocolo[0]
    return resposta(id, {
      protocolVersion,
      capabilities: { tools: {} },
      serverInfo: { name: 'processo', version: '1.0.0' }
    })
  }
  // Notificações não têm id e não recebem resposta
  if (id === undefined) return null
  if (method === 'ping') return resposta(id, {})
  if (method === 'tools/list') {
    return resposta(id, { tools: ferramentas.map(({ executar, ...definicao }) => definicao) })
  }
  if (method !== 'tools/call') return erro(id, -32601, 'Método desconhecido')
  const ferramenta = ferramentas.find(item => item.name === params.name)
  if (!ferramenta) return erro(id, -32602, 'Ferramenta desconhecida')
  const argumentos = params.arguments === undefined ? {} : params.arguments
  const falhaDeEntrada = validarEntrada(argumentos, ferramenta.inputSchema)
  if (falhaDeEntrada) return erro(id, -32602, falhaDeEntrada)
  try {
    return resposta(id, await ferramenta.executar(argumentos))
  } catch (falha) {
    return resposta(id, recusa(falha instanceof Error ? falha.message : String(falha)))
  }
}

for await (const linha of createInterface({ input: process.stdin })) {
  try {
    const mensagem = await tratar(JSON.parse(linha))
    if (mensagem) process.stdout.write(JSON.stringify(mensagem) + '\n')
  } catch {
    process.stdout.write(JSON.stringify(erro(null, -32700, 'JSON inválido')) + '\n')
  }
}
