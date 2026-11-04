export class Carrinho {
  itens: number[] = []
  total(): number {
    return this.itens.reduce((soma, valor) => soma + valor, 0)
  }
}
