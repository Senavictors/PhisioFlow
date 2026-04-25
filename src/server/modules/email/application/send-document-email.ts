import {
  EmailDeliveryError,
  EmailSettingsNotConfiguredError,
  PatientEmailMissingError,
} from '../domain/errors'
import { createEmailMessageLog, findEmailSettings } from '../infra/email.repository'
import { sendEmailWithSettings } from '../infra/transporter'
import { getDocumentForDownloadUseCase } from '@/server/modules/documents/application/get-document'
import { renderDocumentPDF } from '@/lib/pdf/render'

interface SendDocumentEmailInput {
  userId: string
  documentId: string
  subject?: string
  message?: string
}

export async function sendDocumentEmailUseCase(input: SendDocumentEmailInput) {
  const settings = await findEmailSettings(input.userId)
  if (!settings) {
    throw new EmailSettingsNotConfiguredError()
  }

  const document = await getDocumentForDownloadUseCase(input.documentId, input.userId)
  if (!document) {
    throw new Error('Documento não encontrado')
  }

  const recipient = document.patient.email?.trim()
  if (!recipient) {
    throw new PatientEmailMissingError()
  }

  const primaryPlan = document.patient.treatmentPlans?.[0] ?? null

  const pdf = await renderDocumentPDF({
    type: document.type,
    userName: document.user.name,
    patient: {
      name: document.patient.name,
      birthDate: document.patient.birthDate,
      phone: document.patient.phone,
      area: primaryPlan?.area,
      classification: document.patient.classification,
      clinicalRecord: document.patient.clinicalRecord,
    },
    period: document.period ?? undefined,
    sessions: document.patient.sessions,
  })

  const subject = input.subject?.trim() || `${document.title}`
  const greeting = `Olá, ${document.patient.name}!`
  const body =
    input.message?.trim() ||
    `Segue em anexo o documento "${document.title}" emitido pelo PhysioFlow.\n\nQualquer dúvida, estou à disposição.`

  const text = `${greeting}\n\n${body}\n\n— ${document.user.name}`

  try {
    const { messageId } = await sendEmailWithSettings(settings, {
      to: recipient,
      subject,
      text,
      attachments: [
        {
          filename: `${document.title}.pdf`,
          content: pdf,
          contentType: 'application/pdf',
        },
      ],
    })

    return createEmailMessageLog({
      userId: input.userId,
      patientId: document.patientId,
      documentId: document.id,
      type: 'DOCUMENT',
      status: 'SENT',
      to: recipient,
      subject,
      providerId: messageId || null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao enviar e-mail'
    await createEmailMessageLog({
      userId: input.userId,
      patientId: document.patientId,
      documentId: document.id,
      type: 'DOCUMENT',
      status: 'FAILED',
      to: recipient,
      subject,
      errorMessage: message,
    })
    throw new EmailDeliveryError(message)
  }
}
