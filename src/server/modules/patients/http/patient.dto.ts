import { z } from 'zod'

const optionalDateString = z
  .string()
  .trim()
  .refine((value) => value === '' || !Number.isNaN(Date.parse(value)), 'Data inválida')
  .optional()

const optionalEmail = z
  .union([z.string().trim().email('E-mail inválido'), z.literal('')])
  .optional()

const optionalText = z.string().trim().optional()

export const createPatientDTO = z.object({
  name: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres'),
  birthDate: optionalDateString,
  phone: optionalText,
  email: optionalEmail,
  classification: z.enum(['ELDERLY', 'PCD', 'POST_ACCIDENT', 'STANDARD']).default('STANDARD'),
  area: z.enum(['PILATES', 'MOTOR', 'AESTHETIC', 'HOME_CARE']),
  notes: optionalText,
  mainComplaint: optionalText,
  medicalHistory: optionalText,
  medications: optionalText,
  allergies: optionalText,
})

export const updatePatientDTO = z.object({
  name: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres').optional(),
  birthDate: optionalDateString,
  phone: optionalText,
  email: optionalEmail,
  classification: z.enum(['ELDERLY', 'PCD', 'POST_ACCIDENT', 'STANDARD']).optional(),
  area: z.enum(['PILATES', 'MOTOR', 'AESTHETIC', 'HOME_CARE']).optional(),
  notes: optionalText,
  mainComplaint: optionalText,
  medicalHistory: optionalText,
  medications: optionalText,
  allergies: optionalText,
})

export const listPatientsDTO = z.object({
  area: z.enum(['PILATES', 'MOTOR', 'AESTHETIC', 'HOME_CARE']).optional(),
  classification: z.enum(['ELDERLY', 'PCD', 'POST_ACCIDENT', 'STANDARD']).optional(),
  search: z.string().trim().optional(),
})

export type CreatePatientDTO = z.infer<typeof createPatientDTO>
export type UpdatePatientDTO = z.infer<typeof updatePatientDTO>
export type ListPatientsDTO = z.infer<typeof listPatientsDTO>
