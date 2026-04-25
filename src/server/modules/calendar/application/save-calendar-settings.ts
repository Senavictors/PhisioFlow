import type { UpdateCalendarSettingsDTO } from '../http/calendar.dto'
import { CalendarNotConnectedError } from '../domain/errors'
import { findCalendarConnection, updateCalendarSettings } from '../infra/calendar.repository'
import { toCalendarConnectionSafe } from './get-calendar-connection'

export async function saveCalendarSettingsUseCase(userId: string, dto: UpdateCalendarSettingsDTO) {
  const existing = await findCalendarConnection(userId)
  if (!existing) throw new CalendarNotConnectedError()

  const connection = await updateCalendarSettings(userId, {
    calendarId: dto.calendarId,
    calendarSummary: dto.calendarSummary,
    syncNewSessionsByDefault: dto.syncNewSessionsByDefault,
  })

  return toCalendarConnectionSafe(connection)
}
