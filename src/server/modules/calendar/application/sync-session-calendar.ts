import { decryptSecret } from '@/lib/crypto'
import { SessionNotFoundError } from '@/server/modules/sessions/application/get-session'
import { findSessionById } from '@/server/modules/sessions/infra/session.repository'
import {
  CalendarNotConfiguredError,
  CalendarNotConnectedError,
  CalendarSyncError,
} from '../domain/errors'
import {
  findCalendarConnection,
  findCalendarEventLink,
  markCalendarEventLinkFailed,
  upsertCalendarEventLink,
} from '../infra/calendar.repository'
import { buildAuthorizedClient } from '../infra/google-oauth'
import { createGoogleCalendarEvent, updateGoogleCalendarEvent } from '../infra/google-calendar'

export async function syncSessionToGoogleCalendarUseCase(input: {
  userId: string
  sessionId: string
  calendarId?: string
}) {
  const [connection, session, existingLink] = await Promise.all([
    findCalendarConnection(input.userId),
    findSessionById(input.sessionId, input.userId),
    findCalendarEventLink(input.sessionId, input.userId),
  ])

  if (!connection) throw new CalendarNotConnectedError()
  if (!session) throw new SessionNotFoundError('Sessão não encontrada')
  if (session.status === 'CANCELADO') {
    throw new CalendarSyncError('Atendimentos cancelados não são sincronizados.')
  }

  const calendarId = input.calendarId ?? connection.calendarId
  if (!calendarId) throw new CalendarNotConfiguredError()

  const auth = await buildAuthorizedClient({
    refreshToken: decryptSecret(connection.encryptedRefreshToken),
    accessToken: connection.encryptedAccessToken
      ? decryptSecret(connection.encryptedAccessToken)
      : null,
    accessTokenExpiresAt: connection.accessTokenExpiresAt,
  })

  try {
    const shouldUpdateExisting = existingLink?.externalEventId && existingLink.status !== 'REMOVED'

    const externalEventId = shouldUpdateExisting
      ? await updateGoogleCalendarEvent(auth, {
          calendarId: existingLink.calendarId,
          eventId: existingLink.externalEventId,
          session,
        })
      : await createGoogleCalendarEvent(auth, {
          calendarId,
          session,
        })

    return upsertCalendarEventLink({
      userId: input.userId,
      sessionId: input.sessionId,
      externalEventId,
      calendarId,
      status: 'SYNCED',
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Não foi possível sincronizar com Google Calendar.'

    if (existingLink) {
      await markCalendarEventLinkFailed(existingLink.id, message)
    }

    throw new CalendarSyncError(message)
  }
}
