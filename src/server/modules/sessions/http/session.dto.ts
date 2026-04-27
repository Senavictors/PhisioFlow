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
const attendanceTypeEnum = z.enum(['CLINIC', 'HOME_CARE', 'HOSPITAL', 'CORPORATE', 'ONLINE'])

const therapyAreaEnum = z.enum([
  'ORTOPEDICA',
  'NEUROLOGICA',
  'CARDIORESPIRATORIA',
  'ESTETICA',
  'ESPORTIVA',
  'PELVICA',
  'PEDIATRICA',
  'GERIATRICA',
  'PREVENTIVA',
  'OUTRA',
])

export const createSessionDTO = z.object({
  patientId: z.string().trim().min(1, 'Paciente é obrigatório'),
  treatmentPlanId: z.string().trim().optional(),
  date: requiredDateTimeString,
  duration: z.coerce
    .number()
    .int('Duração deve ser um número inteiro')
    .min(15, 'Duração mínima de 15 minutos')
    .max(240, 'Duração máxima de 240 minutos'),
  status: z.enum(['AGENDADO', 'REALIZADO', 'CANCELADO']).default('AGENDADO'),
  workplaceId: z.string().trim().optional(),
  attendanceType: attendanceTypeEnum.optional(),
  expectedFee: z.coerce.number().nonnegative().optional(),
  subjective: optionalText,
  objective: optionalText,
  assessment: optionalText,
  plan: optionalText,
  syncWithGoogleCalendar: optionalBoolean,
})

export const updateSessionDTO = z.object({
  treatmentPlanId: z.string().trim().nullish(),
  date: optionalDateTimeString,
  duration: z.coerce
    .number()
    .int('Duração deve ser um número inteiro')
    .min(15, 'Duração mínima de 15 minutos')
    .max(240, 'Duração máxima de 240 minutos')
    .optional(),
  status: z.enum(['AGENDADO', 'REALIZADO', 'CANCELADO']).optional(),
  workplaceId: z.string().trim().optional(),
  attendanceType: attendanceTypeEnum.optional(),
  expectedFee: z.coerce.number().nonnegative().nullish(),
  subjective: optionalText,
  objective: optionalText,
  assessment: optionalText,
  plan: optionalText,
  syncWithGoogleCalendar: optionalBoolean,
})

export const listSessionsDTO = z.object({
  patientId: z.string().trim().optional(),
  treatmentPlanId: z.string().trim().optional(),
  status: z.enum(['AGENDADO', 'REALIZADO', 'CANCELADO']).optional(),
  attendanceType: attendanceTypeEnum.optional(),
  area: therapyAreaEnum.optional(),
  from: optionalDateTimeString,
  to: optionalDateTimeString,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20),
})

export type CreateSessionDTO = z.infer<typeof createSessionDTO>
export type UpdateSessionDTO = z.infer<typeof updateSessionDTO>
export type ListSessionsDTO = z.infer<typeof listSessionsDTO>
