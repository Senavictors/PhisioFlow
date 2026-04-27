import { findEmailSettings } from '../infra/email.repository'

export interface SafeEmailSettings {
  provider: 'GMAIL_SMTP'
  fromName: string
  smtpUser: string
  isEnabled: boolean
  sendDocumentsByDefault: boolean
  sendSessionRemindersByDefault: boolean
  hasAppPassword: boolean
}

export async function getEmailSettingsUseCase(userId: string): Promise<SafeEmailSettings | null> {
  const settings = await findEmailSettings(userId)
  if (!settings) return null

  return {
    provider: settings.provider,
    fromName: settings.fromName,
    smtpUser: settings.smtpUser,
    isEnabled: settings.isEnabled,
    sendDocumentsByDefault: settings.sendDocumentsByDefault,
    sendSessionRemindersByDefault: settings.sendSessionRemindersByDefault,
    hasAppPassword: Boolean(settings.encryptedAppPassword),
  }
}
