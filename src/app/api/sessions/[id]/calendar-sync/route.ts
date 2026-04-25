import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { SessionNotFoundError } from '@/server/modules/sessions/application/get-session'
import {
  CalendarNotConfiguredError,
  CalendarNotConnectedError,
  CalendarOAuthEnvError,
  CalendarSyncError,
} from '@/server/modules/calendar/domain/errors'
import { syncSessionDTO } from '@/server/modules/calendar/http/calendar.dto'
import { syncSessionToGoogleCalendarUseCase } from '@/server/modules/calendar/application/sync-session-calendar'
import { removeSessionFromGoogleCalendarUseCase } from '@/server/modules/calendar/application/remove-session-calendar'

type Params = { params: Promise<{ id: string }> }

function calendarErrorResponse(error: unknown) {
  if (error instanceof SessionNotFoundError) {
    return NextResponse.json({ message: error.message }, { status: 404 })
  }

  if (
    error instanceof CalendarNotConnectedError ||
    error instanceof CalendarNotConfiguredError ||
    error instanceof CalendarSyncError
  ) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  if (error instanceof CalendarOAuthEnvError) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
}

export async function POST(request: Request, { params }: Params) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const parsed = syncSessionDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const link = await syncSessionToGoogleCalendarUseCase({
      userId: session.userId,
      sessionId: id,
      calendarId: parsed.data.calendarId,
    })
    return NextResponse.json({ link })
  } catch (error) {
    return calendarErrorResponse(error)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params

  try {
    await removeSessionFromGoogleCalendarUseCase({
      userId: session.userId,
      sessionId: id,
    })
    return NextResponse.json({})
  } catch (error) {
    return calendarErrorResponse(error)
  }
}
