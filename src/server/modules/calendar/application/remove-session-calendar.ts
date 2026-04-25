import { decryptSecret } from '@/lib/crypto'
import {
  findCalendarConnection,
  findCalendarEventLink,
  markCalendarEventLinkFailed,
  markCalendarEventLinkRemoved,
} from '../infra/calendar.repository'
import { buildAuthorizedClient } from '../infra/google-oauth'
import { deleteGoogleCalendarEvent } from '../infra/google-calendar'

export async function removeSessionFromGoogleCalendarUseCase(input: {
  userId: string
  sessionId: string
}) {
  const link = await findCalendarEventLink(input.sessionId, input.userId)
  if (!link || link.status === 'REMOVED') return

  const connection = await findCalendarConnection(input.userId)
  if (!connection) {
    await markCalendarEventLinkRemoved(link.id)
    return
  }

  try {
    const auth = await buildAuthorizedClient({
      refreshToken: decryptSecret(connection.encryptedRefreshToken),
      accessToken: connection.encryptedAccessToken
        ? decryptSecret(connection.encryptedAccessToken)
        : null,
      accessTokenExpiresAt: connection.accessTokenExpiresAt,
    })

    await deleteGoogleCalendarEvent(auth, {
      calendarId: link.calendarId,
      eventId: link.externalEventId,
    })

    await markCalendarEventLinkRemoved(link.id)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Não foi possível remover o evento do Google Calendar.'
    await markCalendarEventLinkFailed(link.id, message)
  }
}
