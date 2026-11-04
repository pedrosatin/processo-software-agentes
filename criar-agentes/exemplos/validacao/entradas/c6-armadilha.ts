// Evita class, any e ponto e vírgula; veja o guia do projeto.
export const aviso = (): string => {
  const texto = "classe any; ponto e vírgula"
  return [...texto].sort().join('')
}
