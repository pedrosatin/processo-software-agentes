export const dividir = (dividendo: number, divisor: number): number => {
  if (divisor === 0) throw new Error("Divisor não pode ser zero")
  return dividendo / divisor
}
