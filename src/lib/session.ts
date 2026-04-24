import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'
import type { SessionData } from '@/server/modules/auth/domain/session'

const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'phisioflow_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  },
}

export type AppSession = IronSession<SessionData>

export async function getSession(): Promise<AppSession> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
