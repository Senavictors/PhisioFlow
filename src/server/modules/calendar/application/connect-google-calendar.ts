import { encryptSecret } from '@/lib/crypto'
import { exchangeCodeForTokens } from '../infra/google-oauth'
import { upsertCalendarConnection } from '../infra/calendar.repository'
import { toCalendarConnectionSafe } from './get-calendar-connection'

export async function connectGoogleCalendarUseCase(userId: string, code: string) {
  const result = await exchangeCodeForTokens(code)

  const connection = await upsertCalendarConnection({
    userId,
    accountEmail: result.email,
    encryptedRefreshToken: encryptSecret(result.refreshToken),
    encryptedAccessToken: result.accessToken ? encryptSecret(result.accessToken) : null,
    accessTokenExpiresAt: result.accessTokenExpiresAt,
  })

  return toCalendarConnectionSafe(connection)
}
