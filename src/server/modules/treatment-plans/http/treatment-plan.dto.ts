import { z } from 'zod'

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

const specialtyEnum = z.enum([
  'PILATES',
  'RPG',
  'ACUPUNTURA',
  'LIBERACAO_MIOFASCIAL',
  'VENTOSATERAPIA',
  'DRY_NEEDLING',
  'TERAPIA_MANUAL',
  'OUTRA',
])

const attendanceTypeEnum = z.enum(['CLINIC', 'HOME_CARE', 'HOSPITAL', 'CORPORATE', 'ONLINE'])
const pricingModelEnum = z.enum(['PER_SESSION', 'PACKAGE'])
const planStatusEnum = z.enum(['ACTIVE', 'COMPLETED', 'CANCELED', 'PAUSED'])

const optionalDateString = z
  .string()
  .trim()
  .refine((value) => value === '' || !Number.isNaN(Date.parse(value)), 'Data inválida')
  .optional()

const optionalText = z.string().trim().optional()

export const createTreatmentPlanDTO = z
  .object({
    workplaceId: z.string().trim().min(1, 'Local de trabalho é obrigatório'),
    area: therapyAreaEnum,
    specialties: z.array(specialtyEnum).default([]),
    attendanceType: attendanceTypeEnum,
    pricingModel: pricingModelEnum.default('PER_SESSION'),
    sessionPrice: z.coerce.number().nonnegative().optional(),
    totalSessions: z.coerce.number().int().positive().optional(),
    packageAmount: z.coerce.number().nonnegative().optional(),
    startsAt: optionalDateString,
    endsAt: optionalDateString,
    notes: optionalText,
  })
  .refine(
    (data) => data.pricingModel !== 'PACKAGE' || (data.totalSessions && data.totalSessions > 0),
    { message: 'Pacote requer total de sessões', path: ['totalSessions'] }
  )

export const updateTreatmentPlanDTO = z.object({
  workplaceId: z.string().trim().min(1).optional(),
  area: therapyAreaEnum.optional(),
  specialties: z.array(specialtyEnum).optional(),
  attendanceType: attendanceTypeEnum.optional(),
  pricingModel: pricingModelEnum.optional(),
  status: planStatusEnum.optional(),
  sessionPrice: z.coerce.number().nonnegative().optional(),
  totalSessions: z.coerce.number().int().positive().optional(),
  packageAmount: z.coerce.number().nonnegative().optional(),
  startsAt: optionalDateString,
  endsAt: optionalDateString,
  notes: optionalText,
})

export const listTreatmentPlansDTO = z.object({
  status: planStatusEnum.optional(),
})

export type CreateTreatmentPlanDTO = z.infer<typeof createTreatmentPlanDTO>
export type UpdateTreatmentPlanDTO = z.infer<typeof updateTreatmentPlanDTO>
export type ListTreatmentPlansDTO = z.infer<typeof listTreatmentPlansDTO>
