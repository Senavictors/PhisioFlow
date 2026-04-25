import 'server-only'
import nodemailer, { type Transporter } from 'nodemailer'
import type Mail from 'nodemailer/lib/mailer'
import { decryptSecret } from '@/lib/crypto'
import type { EmailSettings } from '@/generated/prisma/client'

function buildTransporter(settings: EmailSettings): Transporter {
  const password = decryptSecret(settings.encryptedAppPassword)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: settings.smtpUser,
      pass: password,
    },
  })
}

export interface EmailSendInput {
  to: string
  subject: string
  text: string
  html?: string
  attachments?: Mail.Attachment[]
}

export interface EmailSendResult {
  messageId: string
}

export async function sendEmailWithSettings(
  settings: EmailSettings,
  input: EmailSendInput
): Promise<EmailSendResult> {
  const transporter = buildTransporter(settings)
  const info = await transporter.sendMail({
    from: { name: settings.fromName, address: settings.smtpUser },
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachments,
  })
  return { messageId: info.messageId ?? '' }
}
