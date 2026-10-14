import { execFile } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { z } from 'zod'
import type { Caso, ResultadoCaso, Suite } from './contratos.js'
import { resultadoCasoSchema } from './contratos.js'

const executor = fileURLToPath(new URL('./executor.mjs', import.meta.url))

// Remove os tipos e grava um módulo JavaScript que o processo filho importa sem tsx
export const transpilar = async (codigo: string, destino: string): Promise<string> => {
  const { outputText } = ts.transpileModule(codigo, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
  })
  await writeFile(destino, outputText, 'utf8')
  return destino
}

// O código gerado roda em outro processo, sem as chaves do ambiente, com prazo,
// sem escrita em disco e sem criar processos. A leitura fica restrita ao módulo e ao executor
export const executarCasos = async (moduloJs: string, casos: Caso[]): Promise<ResultadoCaso[]> =>
  await new Promise((resolver, rejeitar) => {
    const argumentos = ['--permission', `--allow-fs-read=${executor}`, `--allow-fs-read=${moduloJs}`, executor, moduloJs]
    const filho = execFile(process.execPath, argumentos, {
      env: { PATH: process.env.PATH ?? '' }, timeout: 10000, maxBuffer: 256000
    }, (erro, stdout, stderr) => {
      if (erro) return rejeitar(new Error(`Execução falhou: ${(stderr || erro.message).trim().slice(0, 400)}`))
      try {
        resolver(z.array(resultadoCasoSchema).parse(JSON.parse(stdout)))
      } catch (falha) {
        rejeitar(falha instanceof Error ? falha : new Error('Saída do executor inválida'))
      }
    })
    filho.stdin?.end(JSON.stringify({ casos }))
  })

export const resumir = (resultados: ResultadoCaso[]): Suite => ({
  total: resultados.length,
  aprovados: resultados.filter(resultado => resultado.aprovado).length,
  falhas: resultados.filter(resultado => !resultado.aprovado)
})

// Falha de import ou de sintaxe reprova todos os casos com o mesmo detalhe
export const executarSuite = async (moduloJs: string, casos: Caso[]): Promise<Suite> => {
  try {
    return resumir(await executarCasos(moduloJs, casos))
  } catch (erro) {
    const detalhe = erro instanceof Error ? erro.message : 'Falha desconhecida'
    return resumir(casos.map(caso => ({ nome: caso.nome, criterio: caso.criterio, aprovado: false, detalhe })))
  }
}
