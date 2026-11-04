export const ordenar = (numeros: number[]): number[] => {
  numeros.sort((a, b) => a - b)
  return numeros
}
