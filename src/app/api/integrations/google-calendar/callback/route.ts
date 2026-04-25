import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  CalendarOAuthEnvError,
  CalendarOAuthStateError,
} from '@/server/modules/calendar/domain/errors'
import { verifyOAuthState } from '@/server/modules/calendar/infra/google-oauth'
import { connectGoogleCalendarUseCase } from '@/server/modules/calendar/application/connect-google-calendar'

function redirectToSettings(request: Request, params: Record<string, string>) {
  const url = new URL('/configuracoes/integracoes', request.url)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return NextResponse.redirect(url)
}

export async function GET(request: Request) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error')

  if (oauthError) {
    return redirectToSettings(request, { calendar: 'error' })
  }

  if (!code || !state) {
    return redirectToSettings(request, { calendar: 'error' })
  }

  try {
    verifyOAuthState(state, session.userId)
    await connectGoogleCalendarUseCase(session.userId, code)
    return redirectToSettings(request, { calendar: 'connected' })
  } catch (error) {
    if (error instanceof CalendarOAuthStateError || error instanceof CalendarOAuthEnvError) {
      return redirectToSettings(request, { calendar: 'error', reason: error.message })
    }

    return redirectToSettings(request, { calendar: 'error' })
  }
}
