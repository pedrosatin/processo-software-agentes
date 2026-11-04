// Confere os agentes spec e coder, executa os casos de referência e grava entrega/evidencia-<RA>.json.
// Uso: node evidencia.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { raValido, pedidoDoRa, lerPedidoAtual, testar, lerAgentes, PASTAS_AGENTES } from './comum.mjs'

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
  const criteriosNoSpec = new Set(specMd.match(/\bC0?\d+\b/g) ?? []).size
  const encontrados = agentes.map(a => `${a.nome || '(sem name)'} em ${a.arquivo}`).join('; ') || 'nenhum arquivo de agente'
  const falta = (a, ...itens) => itens.filter(([ok]) => !ok).map(([, texto]) => texto).join(' ') || ''
  const problemasAgente = (lista, saida) => lista.length === 0 ? '' : lista.map(a => falta(a,
    [a.descricao.length >= 20, `A description de ${a.arquivo} tem ${a.descricao.length} caracteres e precisa de 20 ou mais.`],
    [a.instrucoes.includes('saida/spec.md'), `As instruções de ${a.arquivo} precisam citar saida/spec.md.`],
    ...(saida ? [[a.instrucoes.includes(saida), `As instruções de ${a.arquivo} precisam citar ${saida}.`]] : []))).filter(Boolean).join(' ')
  const nomeFuncao = `${pedido.funcao}.ts`
  const conferencias = [
    [pedido.id === esperado, `pedido ${pedido.id} (${pedido.funcao}) corresponde ao RA ${ra}`,
      `O RA ${ra} sorteia o pedido ${esperado}, mas o pedido atual é ${pedido.id}. Rode node pedido.mjs ${ra} de novo. Isso apaga respostas.md, então o spec precisa rodar outra vez.`],
    [spec.length > 0, `agente spec definido${spec.length ? ` em ${spec.map(a => a.arquivo).join(', ')}` : ''}`,
      `Nenhum agente com name igual a spec em ${PASTAS_AGENTES.join(', ')} dentro desta pasta (criar-agentes). Encontrado: ${encontrados}.`],
    [spec.some(a => a.descricao.length >= 20 && a.instrucoes.includes('saida/spec.md')), 'spec com descrição e instruções que gravam saida/spec.md',
      problemasAgente(spec) || 'Defina o agente spec antes.'],
    [coder.length > 0, `agente coder definido${coder.length ? ` em ${coder.map(a => a.arquivo).join(', ')}` : ''}`,
      `Nenhum agente com name igual a coder em ${PASTAS_AGENTES.join(', ')} dentro desta pasta (criar-agentes). Encontrado: ${encontrados}.`],
    [coder.some(a => a.descricao.length >= 20 && a.instrucoes.includes('saida/spec.md') && a.instrucoes.includes(nomeFuncao)), `coder com instruções que leem saida/spec.md e gravam saida/${nomeFuncao}`,
      problemasAgente(coder, nomeFuncao) || 'Defina o agente coder antes.'],
    [/\bC0?1\b/.test(specMd) && temSecao(specMd, 'Crit'), 'saida/spec.md com critérios numerados',
      specMd ? 'O arquivo precisa de um título com Critérios (por exemplo ## Critérios) e uma linha com C01. Peça ao spec o formato C01, C02...' : 'saida/spec.md não existe. O spec precisa rodar e gravar o arquivo.'],
    [!/Ainda sem respostas/.test(respostas) && respostas.trim().length > 40, 'respostas.md preenchido depois das dúvidas',
      'respostas.md ainda está vazio. Copie as respostas de pedidos/' + pedido.id + '/respostas.md, acrescente a sua decisão para dúvidas novas, e rode o spec de novo.'],
    [!testes.erro, testes.erro ?? `${arquivoCodigo} exporta ${pedido.funcao}`,
      'O coder precisa gravar o arquivo com a função exportada. Se o harness escreveu o código na conversa principal, a delegação ao coder não aconteceu.'],
    [!testes.erro && aprovados === testes.resultados.length, `${aprovados} de ${pedido.casos.length} casos de referência aprovados`,
      'Leia as linhas "falha em" abaixo. Cada uma diz o resultado esperado e o recebido. Peça ao coder para corrigir a partir delas.'],
  ]

  const evidencia = {
    ra, pedido: pedido.id, funcao: pedido.funcao, gerado_em: new Date().toISOString(), node: process.version,
    agentes: agentes.map(({ harness, arquivo, nome, conteudo }) => ({ harness, arquivo, nome, conteudo })),
    spec_md: specMd, respostas_md: respostas,
    codigo: await ler(arquivoCodigo),
    testes: { erro: testes.erro ?? null, aprovados, total: pedido.casos.length, taxa_acerto: Math.round(aprovados * 100 / pedido.casos.length), ms: testes.ms ?? null, resultados: testes.resultados },
    criterios_no_spec: criteriosNoSpec,
    conferencias: conferencias.map(([ok, texto]) => ({ ok, texto })),
  }
  await mkdir('entrega', { recursive: true })
  const destino = join('entrega', `evidencia-${ra}.json`)
  await writeFile(destino, JSON.stringify(evidencia, null, 2) + '\n')

  console.log(`RA ${ra}: pedido ${pedido.id}, ${pedido.funcao}\n`)
  conferencias.forEach(([ok, texto, dica]) => {
    console.log(linha(ok, texto))
    if (!ok && dica) console.log(`         O que fazer: ${dica}`)
  })
  testes.resultados.filter(x => !x.passou).forEach(x => console.log(`         falha em "${x.nome}": ${x.detalhe}`))
  const falhas = conferencias.filter(([ok]) => !ok).length
  console.log(`\nTaxa de acerto nos casos de referência: ${evidencia.testes.taxa_acerto}%`)
  console.log(`Critérios no spec.md: ${criteriosNoSpec}. Casos de referência: ${pedido.casos.length}. Critério sem caso de referência não entra na taxa de acerto.`)
  console.log(`Arquivo gravado em ${destino}`)
  console.log(falhas === 0 ? '\nTodas as conferências passaram.' : `\n${falhas} de ${conferencias.length} conferências falharam. Corrija e execute de novo antes de enviar.`)
  console.log('Esta evidência confere arquivos e testes. Ela não prova que o harness chamou os agentes. Anexe também o print da delegação.')
  return falhas === 0 ? 0 : 1
}

try {
  process.exitCode = await principal()
} catch (erro) {
  console.error(erro.message)
  process.exitCode = 2
}
