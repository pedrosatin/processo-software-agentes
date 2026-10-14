import { z } from 'zod'

export const tarefaSchema = z.object({
  id: z.number().int(),
  titulo: z.string(),
  concluida: z.boolean()
}).strict()

export const specSchema = z.object({
  requisito: z.string().min(1),
  assinatura: z.string().min(1),
  criterios: z.array(z.string().min(1)).min(3),
  duvidas: z.array(z.string())
}).strict()

export const propostaSchema = z.object({
  codigo: z.string().min(1),
  explicacao: z.string().min(1)
}).strict()

export const casoSchema = z.object({
  nome: z.string().min(1),
  criterio: z.string().min(1),
  tarefas: z.array(tarefaSchema),
  filtro: z.object({ estado: z.string(), termo: z.string().optional() }).strict(),
  esperadoIds: z.array(z.number().int()).optional(),
  esperadoErro: z.string().optional()
}).strict().refine(
  caso => (caso.esperadoIds === undefined) !== (caso.esperadoErro === undefined),
  'Cada caso informa esperadoIds ou esperadoErro'
)

// O tester entrega exatamente cinco casos. A suíte de referência pode ter mais
export const casosTesterSchema = z.object({ casos: z.array(casoSchema).length(5) }).strict()
export const casosReferenciaSchema = z.object({ casos: z.array(casoSchema).min(1) }).strict()

export const resultadoCasoSchema = z.object({
  nome: z.string(),
  criterio: z.string(),
  aprovado: z.boolean(),
  detalhe: z.string()
}).strict()

export const processoSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  pedido: z.string().min(1),
  limiteCorrecoes: z.number().int().min(0).max(3),
  // Catálogo de materiais do projeto. { "arquivo": "x" } aponta para um arquivo do cenário
  materiais: z.record(z.string(), z.unknown()).default({}),
  // Quais materiais cada agente recebe. Este campo é editável pelo aluno
  contexto: z.object({
    spec: z.array(z.string()).default([]),
    coder: z.array(z.string()).default([]),
    tester: z.array(z.string()).default([])
  }).strict(),
  gates: z.array(z.string()),
  revisaoNoCiclo: z.array(z.string()).default([]),
  parametros: z.record(z.string(), z.number()).default({})
}).strict().superRefine((processo, ctx) => {
  Object.entries(processo.contexto).forEach(([agente, nomes]) => nomes.forEach(nome => {
    if (!(nome in processo.materiais)) ctx.addIssue({ code: 'custom', message: `Material ${nome} do contexto do ${agente} não existe em materiais` })
  }))
})

export type Tarefa = z.infer<typeof tarefaSchema>
export type Spec = z.infer<typeof specSchema>
export type Proposta = z.infer<typeof propostaSchema>
export type Caso = z.infer<typeof casoSchema>
export type ResultadoCaso = z.infer<typeof resultadoCasoSchema>
export type Processo = z.infer<typeof processoSchema>
export type Agente = 'spec' | 'coder' | 'tester'
export type Suite = { total: number, aprovados: number, falhas: ResultadoCaso[] }
export type ResultadoGate = { gate: string, aprovado: boolean, detalhes: string[] }
