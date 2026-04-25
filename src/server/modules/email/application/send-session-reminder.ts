import {
  EmailDeliveryError,
  EmailSettingsNotConfiguredError,
  PatientEmailMissingError,
} from '../domain/errors'
import { createEmailMessageLog, findEmailSettings } from '../infra/email.repository'
import { sendEmailWithSettings } from '../infra/transporter'
import { getSessionUseCase } from '@/server/modules/sessions/application/get-session'
import { prisma } from '@/lib/prisma'
import { formatDateLongPtBr, formatTimePtBr } from '@/lib/date'

interface SendSessionReminderInput {
  userId: string
  sessionId: string
  subject?: string
  message?: string
}

export async function sendSessionReminderEmailUseCase(input: SendSessionReminderInput) {
  const settings = await findEmailSettings(input.userId)
  if (!settings) {
    throw new EmailSettingsNotConfiguredError()
  }

  const session = await getSessionUseCase(input.sessionId, input.userId)

  const patient = await prisma.patient.findFirst({
    where: { id: session.patientId, userId: input.userId },
  })

  if (!patient) {
    throw new Error('Paciente não encontrado')
  }

  const recipient = patient.email?.trim()
  if (!recipient) {
    throw new PatientEmailMissingError()
  }

  const user = await prisma.user.findUnique({ where: { id: input.userId } })
  const therapistName = user?.name ?? 'Seu fisioterapeuta'

  const dateLabel = formatDateLongPtBr(session.date)
  const timeLabel = formatTimePtBr(session.date)
  const typeLabel = session.type === 'HOME_CARE' ? 'atendimento domiciliar' : 'atendimento presencial'

  const addressLine =
    session.type === 'HOME_CARE'
      ? [patient.address, patient.neighborhood, patient.city].filter(Boolean).join(', ')
      : ''

  const subject = input.subject?.trim() || `Lembrete: ${typeLabel} em ${dateLabel}`

  const introBody =
    input.message?.trim() ||
    `Passando para confirmar o seu ${typeLabel} agendado.`

  const lines: string[] = [
    `Olá, ${patient.name}!`,
    '',
    introBody,
    '',
    `📅 Data: ${dateLabel}`,
    `🕒 Horário: ${timeLabel}`,
    `⏱️ Duração: ${session.duration} minutos`,
    `📍 Modalidade: ${typeLabel}`,
  ]

  if (addressLine) {
    lines.push(`🏠 Endereço: ${addressLine}`)
  }

  lines.push('', `Até lá!`, `— ${therapistName}`)

  const text = lines.join('\n')

  try {
    const { messageId } = await sendEmailWithSettings(settings, {
      to: recipient,
      subject,
      text,
    })

    return createEmailMessageLog({
      userId: input.userId,
      patientId: patient.id,
      sessionId: session.id,
      type: 'SESSION_REMINDER',
      status: 'SENT',
      to: recipient,
      subject,
      providerId: messageId || null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao enviar e-mail'
    await createEmailMessageLog({
      userId: input.userId,
      patientId: patient.id,
      sessionId: session.id,
      type: 'SESSION_REMINDER',
      status: 'FAILED',
      to: recipient,
      subject,
      errorMessage: message,
    })
    throw new EmailDeliveryError(message)
  }
}
