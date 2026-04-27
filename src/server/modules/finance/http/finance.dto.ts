import { z } from 'zod'

const requiredDateString = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Data inválida')

const granularityEnum = z.enum(['day', 'week', 'month'])

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

function splitCSV(value: string | undefined) {
  if (!value) return undefined
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return items.length > 0 ? items : undefined
}

export const financeSummaryDTO = z.object({
  from: requiredDateString,
  to: requiredDateString,
  granularity: granularityEnum.default('day'),
  workplaceIds: z.string().optional().transform(splitCSV).pipe(z.array(z.string()).optional()),
  areas: z.string().optional().transform(splitCSV).pipe(z.array(therapyAreaEnum).optional()),
})

export type FinanceSummaryDTO = z.infer<typeof financeSummaryDTO>
