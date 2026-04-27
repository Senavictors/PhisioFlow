import { encryptSecret } from '@/lib/crypto'
import type { UpdateEmailSettingsDTO } from '../http/email.dto'
import { upsertEmailSettings } from '../infra/email.repository'

export async function saveEmailSettingsUseCase(userId: string, input: UpdateEmailSettingsDTO) {
  const trimmedPassword = input.appPassword?.trim() ?? ''
  const cleanPassword = trimmedPassword ? trimmedPassword.replace(/\s+/g, '') : ''
  const encrypted = cleanPassword ? encryptSecret(cleanPassword) : undefined

  return upsertEmailSettings({
    userId,
    fromName: input.fromName,
    smtpUser: input.smtpUser.toLowerCase(),
    encryptedAppPassword: encrypted,
    isEnabled: input.isEnabled,
    sendDocumentsByDefault: input.sendDocumentsByDefault,
    sendSessionRemindersByDefault: input.sendSessionRemindersByDefault,
  })
}
