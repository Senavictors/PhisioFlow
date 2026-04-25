import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  CalendarNotConnectedError,
  CalendarOAuthEnvError,
} from '@/server/modules/calendar/domain/errors'
import { updateCalendarSettingsDTO } from '@/server/modules/calendar/http/calendar.dto'
import { getCalendarConnectionUseCase } from '@/server/modules/calendar/application/get-calendar-connection'
import { saveCalendarSettingsUseCase } from '@/server/modules/calendar/application/save-calendar-settings'
import { disconnectGoogleCalendarUseCase } from '@/server/modules/calendar/application/disconnect-google-calendar'

export async function GET() {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const connection = await getCalendarConnectionUseCase(session.userId)
  return NextResponse.json({ connection })
}

export async function PUT(request: Request) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = updateCalendarSettingsDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const connection = await saveCalendarSettingsUseCase(session.userId, parsed.data)
    return NextResponse.json({ connection })
  } catch (error) {
    if (error instanceof CalendarNotConnectedError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    await disconnectGoogleCalendarUseCase(session.userId)
    return NextResponse.json({})
  } catch (error) {
    if (error instanceof CalendarOAuthEnvError) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
