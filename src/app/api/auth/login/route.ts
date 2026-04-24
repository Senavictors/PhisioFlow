import { NextResponse } from 'next/server'
import { getInfraErrorResponse, logRouteError } from '@/lib/http-errors'
import { loginDTO } from '@/server/modules/auth/http/auth.dto'
import { loginUser, InvalidCredentialsError } from '@/server/modules/auth/application/login'
import { getSession } from '@/lib/session'

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = loginDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const user = await loginUser(parsed.data)
    const session = await getSession()
    session.userId = user.id
    session.email = user.email
    session.name = user.name
    await session.save()

    return NextResponse.json(user)
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return NextResponse.json({ message: err.message }, { status: 401 })
    }

    logRouteError('api/auth/login', err)

    const infraError = getInfraErrorResponse(err)
    if (infraError) {
      return NextResponse.json({ message: infraError.message }, { status: infraError.status })
    }

    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
