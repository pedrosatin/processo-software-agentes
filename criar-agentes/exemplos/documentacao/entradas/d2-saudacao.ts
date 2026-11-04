export const saudacao = (nome: string): string => {
  if (nome.trim() === "") throw new Error("Nome vazio")
  return `Olá, ${nome.trim()}`
}
