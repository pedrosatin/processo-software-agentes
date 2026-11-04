export const somar = (valores: number[]): number => {
  return valores.reduce((soma, valor) => soma + valor, 0)
}
