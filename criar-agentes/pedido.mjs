// Escolhe o pedido pelo RA (ou o exemplo da aula) e prepara pedido.md e respostas.md.
// Uso: node pedido.mjs 12345678-9   ou   node pedido.mjs exemplo
import { copyFile, writeFile, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { raValido, pedidoDoRa } from './comum.mjs'

const arg = (process.argv[2] ?? '').trim()
if (arg !== 'exemplo' && !raValido(arg)) {
  console.error('Informe o RA no formato 12345678-9, ou exemplo para o pedido da aula.')
  process.exit(2)
}
const id = arg === 'exemplo' ? 'E' : pedidoDoRa(arg)
await copyFile(join('pedidos', id, 'pedido.md'), 'pedido.md')
await writeFile('respostas.md', '# Respostas às dúvidas\n\nAinda sem respostas.\n')
await writeFile('.pedido', id + '\n')
if (arg !== 'exemplo') await writeFile('.ra', arg + '\n')
console.log(await readFile('pedido.md', 'utf8'))
console.log(`Pedido ${id} gravado em pedido.md. respostas.md foi esvaziado.`)
console.log(`Quando o spec parar com dúvidas, as respostas de quem fez o pedido estão em pedidos/${id}/respostas.md.`)
