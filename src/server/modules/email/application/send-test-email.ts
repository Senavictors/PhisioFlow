import {
  EmailDeliveryError,
  EmailSettingsNotConfiguredError,
} from '../domain/errors'
import { createEmailMessageLog, findEmailSettings } from '../infra/email.repository'
import { sendEmailWithSettings } from '../infra/transporter'

export async function sendTestEmailUseCase(
  userId: string,
  options: { to?: string } = {}
) {
  const settings = await findEmailSettings(userId)
  if (!settings) {
    throw new EmailSettingsNotConfiguredError()
  }

  const recipient = options.to?.trim() || settings.smtpUser
  const subject = 'PhysioFlow • Teste de envio'
  const text =
    'Este é um e-mail de teste enviado pelo PhysioFlow para validar sua configuração de Gmail.'

  try {
    const { messageId } = await sendEmailWithSettings(settings, {
      to: recipient,
      subject,
      text,
    })

    await createEmailMessageLog({
      userId,
      type: 'TEST',
      status: 'SENT',
      to: recipient,
      subject,
      providerId: messageId || null,
    })

    return { messageId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao enviar e-mail'
    await createEmailMessageLog({
      userId,
      type: 'TEST',
      status: 'FAILED',
      to: recipient,
      subject,
      errorMessage: message,
    })
    throw new EmailDeliveryError(message)
  }
}
