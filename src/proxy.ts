import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/server/modules/auth/domain/session'

const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'phisioflow_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
}

const PUBLIC_PATHS = ['/login', '/register']
const APP_PATHS = [
  '/dashboard',
  '/pacientes',
  '/atendimentos',
  '/agenda',
  '/documentos',
  '/configuracoes',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const isApp = APP_PATHS.some((p) => pathname.startsWith(p))

  if (!isPublic && !isApp) return NextResponse.next()

  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)
  const isAuthenticated = Boolean(session.userId)

  if (isApp && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublic && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pacientes/:path*',
    '/atendimentos/:path*',
    '/agenda/:path*',
    '/documentos/:path*',
    '/configuracoes/:path*',
    '/login',
    '/register',
  ],
}
