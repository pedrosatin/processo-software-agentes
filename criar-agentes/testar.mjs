// Executa os casos de referência do pedido atual contra o código em saida/.
// Uso: node testar.mjs
import { lerPedidoAtual, testar } from './comum.mjs'

try {
  const pedido = await lerPedidoAtual()
  const r = await testar(pedido)
  if (r.erro) {
    console.log(r.erro)
    process.exitCode = 1
  } else {
    r.resultados.forEach(x => console.log(`${x.passou ? 'ok   ' : 'falha'} ${x.nome}${x.detalhe ? `: ${x.detalhe}` : ''}`))
    const ok = r.resultados.filter(x => x.passou).length
    console.log(`\n${ok} de ${r.resultados.length} casos aprovados`)
    process.exitCode = ok === r.resultados.length ? 0 : 1
  }
} catch (erro) {
  console.error(erro.message)
  process.exitCode = 2
}
