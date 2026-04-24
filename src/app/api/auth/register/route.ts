import { NextResponse } from 'next/server'
import { getInfraErrorResponse, logRouteError } from '@/lib/http-errors'
import { registerDTO } from '@/server/modules/auth/http/auth.dto'
import { registerUser, EmailAlreadyExistsError } from '@/server/modules/auth/application/register'

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = registerDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const user = await registerUser(parsed.data)
    return NextResponse.json(user, { status: 201 })
  } catch (err) {
    if (err instanceof EmailAlreadyExistsError) {
      return NextResponse.json({ message: err.message }, { status: 409 })
    }

    logRouteError('api/auth/register', err)

    const infraError = getInfraErrorResponse(err)
    if (infraError) {
      return NextResponse.json({ message: infraError.message }, { status: infraError.status })
    }

    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
