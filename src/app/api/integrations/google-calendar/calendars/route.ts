import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  CalendarNotConnectedError,
  CalendarOAuthEnvError,
} from '@/server/modules/calendar/domain/errors'
import { listGoogleCalendarsUseCase } from '@/server/modules/calendar/application/list-google-calendars'

export async function GET() {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const calendars = await listGoogleCalendarsUseCase(session.userId)
    return NextResponse.json({ calendars })
  } catch (error) {
    if (error instanceof CalendarNotConnectedError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    if (error instanceof CalendarOAuthEnvError) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Erro ao listar agendas' }, { status: 500 })
  }
}
