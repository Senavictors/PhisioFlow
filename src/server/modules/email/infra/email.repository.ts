import { prisma } from '@/lib/prisma'
import type { EmailMessageStatus, EmailMessageType, EmailProvider } from '@/generated/prisma/client'

export interface EmailSettingsUpsertInput {
  userId: string
  fromName: string
  smtpUser: string
  encryptedAppPassword?: string
  provider?: EmailProvider
  isEnabled: boolean
  sendDocumentsByDefault: boolean
  sendSessionRemindersByDefault: boolean
}

export async function findEmailSettings(userId: string) {
  return prisma.emailSettings.findUnique({ where: { userId } })
}

export async function upsertEmailSettings(input: EmailSettingsUpsertInput) {
  const {
    userId,
    fromName,
    smtpUser,
    encryptedAppPassword,
    provider,
    isEnabled,
    sendDocumentsByDefault,
    sendSessionRemindersByDefault,
  } = input

  const existing = await prisma.emailSettings.findUnique({ where: { userId } })

  if (!existing) {
    if (!encryptedAppPassword) {
      throw new Error('Senha de App é obrigatória ao configurar pela primeira vez.')
    }
    return prisma.emailSettings.create({
      data: {
        userId,
        fromName,
        smtpUser,
        encryptedAppPassword,
        provider: provider ?? 'GMAIL_SMTP',
        isEnabled,
        sendDocumentsByDefault,
        sendSessionRemindersByDefault,
      },
    })
  }

  return prisma.emailSettings.update({
    where: { userId },
    data: {
      fromName,
      smtpUser,
      ...(encryptedAppPassword ? { encryptedAppPassword } : {}),
      ...(provider ? { provider } : {}),
      isEnabled,
      sendDocumentsByDefault,
      sendSessionRemindersByDefault,
    },
  })
}

export interface EmailMessageLogInput {
  userId: string
  patientId?: string | null
  documentId?: string | null
  sessionId?: string | null
  type: EmailMessageType
  status: EmailMessageStatus
  to: string
  subject: string
  providerId?: string | null
  errorMessage?: string | null
}

export async function createEmailMessageLog(input: EmailMessageLogInput) {
  return prisma.emailMessage.create({ data: input })
}
