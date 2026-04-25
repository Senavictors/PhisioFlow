import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { CalendarOAuthEnvError } from '@/server/modules/calendar/domain/errors'
import { buildAuthUrl, signOAuthState } from '@/server/modules/calendar/infra/google-oauth'

export async function GET() {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const state = signOAuthState(session.userId)
    return NextResponse.redirect(buildAuthUrl(state))
  } catch (error) {
    if (error instanceof CalendarOAuthEnvError) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
