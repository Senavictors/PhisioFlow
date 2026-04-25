import type { CalendarConnection } from '@/generated/prisma/client'
import { findCalendarConnection } from '../infra/calendar.repository'

export interface CalendarConnectionSafe {
  connected: boolean
  accountEmail?: string
  calendarId?: string
  calendarSummary?: string
  syncNewSessionsByDefault: boolean
}

export function toCalendarConnectionSafe(
  connection: CalendarConnection | null
): CalendarConnectionSafe {
  if (!connection) {
    return {
      connected: false,
      syncNewSessionsByDefault: false,
    }
  }

  return {
    connected: true,
    accountEmail: connection.accountEmail,
    calendarId: connection.calendarId ?? undefined,
    calendarSummary: connection.calendarSummary ?? undefined,
    syncNewSessionsByDefault: connection.syncNewSessionsByDefault,
  }
}

export async function getCalendarConnectionUseCase(userId: string) {
  const connection = await findCalendarConnection(userId)
  return toCalendarConnectionSafe(connection)
}
