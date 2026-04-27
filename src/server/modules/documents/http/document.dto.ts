import { z } from 'zod'

export const createDocumentDTO = z.object({
  patientId: z.string().trim().min(1, 'Paciente é obrigatório'),
  type: z.enum(['LAUDO_FISIOTERAPEUTICO', 'RELATORIO_PROGRESSO', 'DECLARACAO_COMPARECIMENTO']),
  period: z.string().trim().optional(),
})

export const listDocumentsDTO = z.object({
  patientId: z.string().trim().optional(),
  type: z
    .enum(['LAUDO_FISIOTERAPEUTICO', 'RELATORIO_PROGRESSO', 'DECLARACAO_COMPARECIMENTO'])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateDocumentDTO = z.infer<typeof createDocumentDTO>
export type ListDocumentsDTO = z.infer<typeof listDocumentsDTO>
