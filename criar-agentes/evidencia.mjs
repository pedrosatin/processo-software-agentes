// Confere os agentes spec e coder, executa os casos de referência e grava entrega/evidencia-<RA>.json.
// Uso: node evidencia.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { raValido, pedidoDoRa, lerPedidoAtual, testar, lerAgentes } from './comum.mjs'

const linha = (ok, texto) => `${ok ? '[ok]    ' : '[falhou]'} ${texto}`
const ler = async arquivo => (existsSync(arquivo) ? readFile(arquivo, 'utf8') : '')

const principal = async () => {
  const ra = (await ler('.ra')).trim()
  if (!raValido(ra)) {
    console.error('Execute node pedido.mjs <seu RA> antes de gerar a evidência.')
    return 2
  }
  const pedido = await lerPedidoAtual()
  const esperado = pedidoDoRa(ra)
  const agentes = await lerAgentes()
  const spec = agentes.filter(a => a.nome === 'spec')
  const coder = agentes.filter(a => a.nome === 'coder')
  const specMd = await ler(join('saida', 'spec.md'))
  const respostas = await ler('respostas.md')
  const testes = await testar(pedido)
  const aprovados = testes.resultados.filter(x => x.passou).length
  const arquivoCodigo = join('saida', `${pedido.funcao}.ts`)

  const temSecao = (texto, titulo) => new RegExp(`^#+\\s*${titulo}`, 'mi').test(texto)
  const conferencias = [
    [pedido.id === esperado, `pedido ${pedido.id} (${pedido.funcao}) corresponde ao RA ${ra}`],
    [spec.length > 0, `agente spec definido${spec.length ? ` em ${spec.map(a => a.arquivo).join(', ')}` : ''}`],
    [spec.some(a => a.descricao.length >= 20 && a.instrucoes.includes('saida/spec.md')), 'spec com descrição e instruções que gravam saida/spec.md'],
    [coder.length > 0, `agente coder definido${coder.length ? ` em ${coder.map(a => a.arquivo).join(', ')}` : ''}`],
    [coder.some(a => a.descricao.length >= 20 && a.instrucoes.includes('saida/spec.md') && a.instrucoes.includes(`${pedido.funcao}.ts`)), `coder com instruções que leem saida/spec.md e gravam saida/${pedido.funcao}.ts`],
    [/\bC0?1\b/.test(specMd) && temSecao(specMd, 'Crit'), 'saida/spec.md com critérios numerados'],
    [!/Ainda sem respostas/.test(respostas) && respostas.trim().length > 40, 'respostas.md preenchido depois das dúvidas'],
    [!testes.erro, testes.erro ?? `${arquivoCodigo} exporta ${pedido.funcao}`],
    [!testes.erro && aprovados === testes.resultados.length, `${aprovados} de ${pedido.casos.length} casos de referência aprovados`],
  ]

  const evidencia = {
    ra, pedido: pedido.id, funcao: pedido.funcao, gerado_em: new Date().toISOString(), node: process.version,
    agentes: agentes.map(({ harness, arquivo, nome, conteudo }) => ({ harness, arquivo, nome, conteudo })),
    spec_md: specMd, respostas_md: respostas,
    codigo: await ler(arquivoCodigo),
    testes: { erro: testes.erro ?? null, aprovados, total: pedido.casos.length, taxa_acerto: Math.round(aprovados * 100 / pedido.casos.length), ms: testes.ms ?? null, resultados: testes.resultados },
    conferencias: conferencias.map(([ok, texto]) => ({ ok, texto })),
  }
  await mkdir('entrega', { recursive: true })
  const destino = join('entrega', `evidencia-${ra}.json`)
  await writeFile(destino, JSON.stringify(evidencia, null, 2) + '\n')

  console.log(`RA ${ra}: pedido ${pedido.id}, ${pedido.funcao}\n`)
  conferencias.forEach(([ok, texto]) => console.log(linha(ok, texto)))
  testes.resultados.filter(x => !x.passou).forEach(x => console.log(`         falha em "${x.nome}": ${x.detalhe}`))
  console.log(`\nTaxa de acerto nos casos de referência: ${evidencia.testes.taxa_acerto}%`)
  console.log(`Arquivo gravado em ${destino}`)
  return 0
}

try {
  process.exitCode = await principal()
} catch (erro) {
  console.error(erro.message)
  process.exitCode = 2
}
