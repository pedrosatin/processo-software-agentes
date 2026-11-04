export const intervalo = (inicio: number, fim: number): number[] => {
  if (!Number.isInteger(inicio) || !Number.isInteger(fim)) throw new Error("Valores devem ser inteiros")
  if (inicio > fim) throw new Error("Início maior que fim")
  return Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i)
}
