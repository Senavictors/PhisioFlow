import { decryptSecret } from '@/lib/crypto'
import { CalendarNotConnectedError } from '../domain/errors'
import { findCalendarConnection } from '../infra/calendar.repository'
import { buildAuthorizedClient } from '../infra/google-oauth'
import { listGoogleCalendars } from '../infra/google-calendar'

export async function listGoogleCalendarsUseCase(userId: string) {
  const connection = await findCalendarConnection(userId)
  if (!connection) throw new CalendarNotConnectedError()

  const auth = await buildAuthorizedClient({
    refreshToken: decryptSecret(connection.encryptedRefreshToken),
    accessToken: connection.encryptedAccessToken
      ? decryptSecret(connection.encryptedAccessToken)
      : null,
    accessTokenExpiresAt: connection.accessTokenExpiresAt,
  })

  return listGoogleCalendars(auth)
}
