import { findCalendarConnection, findCalendarEventLink } from '../infra/calendar.repository'

export async function syncSessionCalendarAfterMutation(input: {
  userId: string
  sessionId: string
  syncWithGoogleCalendar?: boolean
  status?: string
}) {
  try {
    if (input.status === 'CANCELADO') {
      const { removeSessionFromGoogleCalendarUseCase } = await import('./remove-session-calendar')
      await removeSessionFromGoogleCalendarUseCase(input)
      return
    }

    const [connection, existingLink] = await Promise.all([
      findCalendarConnection(input.userId),
      findCalendarEventLink(input.sessionId, input.userId),
    ])

    if (!connection) return
    if (input.syncWithGoogleCalendar === false) return

    const shouldSync =
      input.syncWithGoogleCalendar === true ||
      connection.syncNewSessionsByDefault ||
      Boolean(existingLink && existingLink.status !== 'REMOVED')

    if (!shouldSync) return

    const { syncSessionToGoogleCalendarUseCase } = await import('./sync-session-calendar')
    await syncSessionToGoogleCalendarUseCase({
      userId: input.userId,
      sessionId: input.sessionId,
      calendarId: connection.calendarId ?? undefined,
    })
  } catch {
    // Falha de calendário não deve impedir o salvamento clínico da sessão.
  }
}
