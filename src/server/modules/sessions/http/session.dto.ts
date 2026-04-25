import { z } from 'zod'

const requiredDateTimeString = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Data inválida')

const optionalDateTimeString = z
  .string()
  .trim()
  .refine((value) => value === '' || !Number.isNaN(Date.parse(value)), 'Data inválida')
  .optional()

const optionalText = z.string().trim().optional()
const optionalBoolean = z.coerce.boolean().optional()

export const createSessionDTO = z.object({
  patientId: z.string().trim().min(1, 'Paciente é obrigatório'),
  date: requiredDateTimeString,
  duration: z.coerce
    .number()
    .int('Duração deve ser um número inteiro')
    .min(15, 'Duração mínima de 15 minutos')
    .max(240, 'Duração máxima de 240 minutos'),
  type: z.enum(['PRESENTIAL', 'HOME_CARE']).default('PRESENTIAL'),
  status: z.enum(['AGENDADO', 'REALIZADO', 'CANCELADO']).default('AGENDADO'),
  subjective: optionalText,
  objective: optionalText,
  assessment: optionalText,
  plan: optionalText,
  syncWithGoogleCalendar: optionalBoolean,
})

export const updateSessionDTO = z.object({
  date: optionalDateTimeString,
  duration: z.coerce
    .number()
    .int('Duração deve ser um número inteiro')
    .min(15, 'Duração mínima de 15 minutos')
    .max(240, 'Duração máxima de 240 minutos')
    .optional(),
  type: z.enum(['PRESENTIAL', 'HOME_CARE']).optional(),
  status: z.enum(['AGENDADO', 'REALIZADO', 'CANCELADO']).optional(),
  subjective: optionalText,
  objective: optionalText,
  assessment: optionalText,
  plan: optionalText,
  syncWithGoogleCalendar: optionalBoolean,
})

export const listSessionsDTO = z.object({
  patientId: z.string().trim().optional(),
  status: z.enum(['AGENDADO', 'REALIZADO', 'CANCELADO']).optional(),
  type: z.enum(['PRESENTIAL', 'HOME_CARE']).optional(),
  area: z.enum(['PILATES', 'MOTOR', 'AESTHETIC', 'HOME_CARE']).optional(),
  from: optionalDateTimeString,
  to: optionalDateTimeString,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateSessionDTO = z.infer<typeof createSessionDTO>
export type UpdateSessionDTO = z.infer<typeof updateSessionDTO>
export type ListSessionsDTO = z.infer<typeof listSessionsDTO>
