import { z } from 'zod'

const paymentMethodEnum = z.enum([
  'PIX',
  'CASH',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'BANK_TRANSFER',
  'INSURANCE',
  'OTHER',
])

const paymentStatusEnum = z.enum(['PAID', 'PENDING', 'PARTIAL', 'REFUNDED'])

const requiredDateString = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Data inválida')

const optionalDateString = z
  .string()
  .trim()
  .refine((value) => value === '' || !Number.isNaN(Date.parse(value)), 'Data inválida')
  .optional()

const optionalText = z.string().trim().optional()

export const registerPaymentDTO = z.object({
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  method: paymentMethodEnum,
  paidAt: requiredDateString,
  notes: optionalText,
})

export const updatePaymentDTO = z.object({
  amount: z.coerce.number().positive().optional(),
  method: paymentMethodEnum.optional(),
  status: paymentStatusEnum.optional(),
  paidAt: optionalDateString,
  notes: optionalText,
})

export const listPaymentsDTO = z.object({
  from: optionalDateString,
  to: optionalDateString,
  patientId: z.string().trim().optional(),
  planId: z.string().trim().optional(),
  status: paymentStatusEnum.optional(),
})

export type RegisterPaymentDTO = z.infer<typeof registerPaymentDTO>
export type UpdatePaymentDTO = z.infer<typeof updatePaymentDTO>
export type ListPaymentsDTO = z.infer<typeof listPaymentsDTO>
