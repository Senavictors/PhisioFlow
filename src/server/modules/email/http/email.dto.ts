import { z } from 'zod'

export const updateEmailSettingsDTO = z.object({
  fromName: z.string().trim().min(2, 'Nome do remetente é obrigatório'),
  smtpUser: z.string().trim().email('E-mail Gmail inválido'),
  appPassword: z
    .string()
    .trim()
    .min(16, 'Senha de App deve ter 16 caracteres')
    .max(32, 'Senha de App não pode exceder 32 caracteres')
    .optional()
    .or(z.literal('')),
  isEnabled: z.coerce.boolean().default(false),
  sendDocumentsByDefault: z.coerce.boolean().default(false),
  sendSessionRemindersByDefault: z.coerce.boolean().default(false),
})

export const sendTestEmailDTO = z.object({
  to: z.string().trim().email('E-mail inválido').optional(),
})

export const sendEmailMessageDTO = z.object({
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().max(5000).optional(),
})

export type UpdateEmailSettingsDTO = z.infer<typeof updateEmailSettingsDTO>
export type SendTestEmailDTO = z.infer<typeof sendTestEmailDTO>
export type SendEmailMessageDTO = z.infer<typeof sendEmailMessageDTO>
