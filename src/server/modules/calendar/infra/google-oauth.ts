import 'server-only'
import { google } from 'googleapis'
import type { OAuth2Client } from 'google-auth-library'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { CalendarOAuthEnvError, CalendarOAuthStateError } from '../domain/errors'

export const CALENDAR_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid',
]

function getEnv() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) {
    throw new CalendarOAuthEnvError()
  }
  return { clientId, clientSecret, redirectUri }
}

export function buildOAuthClient(): OAuth2Client {
  const env = getEnv()
  return new google.auth.OAuth2(env.clientId, env.clientSecret, env.redirectUri)
}

export function buildAuthUrl(state: string): string {
  const client = buildOAuthClient()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: CALENDAR_OAUTH_SCOPES,
    state,
    include_granted_scopes: true,
  })
}

function getStateSecret(): Buffer {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET ausente para assinar state OAuth.')
  return Buffer.from(secret, 'utf8')
}

export function signOAuthState(userId: string): string {
  const nonce = randomBytes(8).toString('base64url')
  const payload = `${userId}.${nonce}`
  const signature = createHmac('sha256', getStateSecret()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifyOAuthState(state: string, expectedUserId: string): void {
  const parts = state.split('.')
  if (parts.length !== 3) throw new CalendarOAuthStateError()
  const [userId, nonce, signature] = parts
  if (userId !== expectedUserId) throw new CalendarOAuthStateError()
  const expected = createHmac('sha256', getStateSecret()).update(`${userId}.${nonce}`).digest()
  let actual: Buffer
  try {
    actual = Buffer.from(signature, 'base64url')
  } catch {
    throw new CalendarOAuthStateError()
  }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new CalendarOAuthStateError()
  }
}

export interface OAuthExchangeResult {
  refreshToken: string
  accessToken: string | null
  accessTokenExpiresAt: Date | null
  email: string
}

export async function exchangeCodeForTokens(code: string): Promise<OAuthExchangeResult> {
  const client = buildOAuthClient()
  const { tokens } = await client.getToken(code)

  if (!tokens.refresh_token) {
    throw new Error(
      'Google não retornou refresh_token. Revogue o acesso na conta Google e tente conectar novamente.'
    )
  }

  client.setCredentials(tokens)
  const oauth2 = google.oauth2({ version: 'v2', auth: client })
  const me = await oauth2.userinfo.get()
  const email = me.data.email
  if (!email) {
    throw new Error('Não foi possível identificar o e-mail da conta Google.')
  }

  return {
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token ?? null,
    accessTokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    email,
  }
}

export async function buildAuthorizedClient(input: {
  refreshToken: string
  accessToken?: string | null
  accessTokenExpiresAt?: Date | null
}): Promise<OAuth2Client> {
  const client = buildOAuthClient()
  client.setCredentials({
    refresh_token: input.refreshToken,
    access_token: input.accessToken ?? undefined,
    expiry_date: input.accessTokenExpiresAt ? input.accessTokenExpiresAt.getTime() : undefined,
  })
  return client
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const client = buildOAuthClient()
  try {
    await client.revokeToken(refreshToken)
  } catch {
    // best-effort revoke; ignore failures
  }
}
