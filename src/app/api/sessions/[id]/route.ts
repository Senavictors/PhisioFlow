import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  getSessionUseCase,
  SessionNotFoundError,
} from '@/server/modules/sessions/application/get-session'
import { updateSessionUseCase } from '@/server/modules/sessions/application/update-session'
import { archiveSessionUseCase } from '@/server/modules/sessions/application/archive-session'
import { updateSessionDTO } from '@/server/modules/sessions/http/session.dto'
import { InvalidSessionScheduleError } from '@/server/modules/sessions/domain/session'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params

  try {
    const result = await getSessionUseCase(id, session.userId)
    return NextResponse.json({ session: result })
  } catch (error) {
    if (error instanceof SessionNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }

    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = updateSessionDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const updatedSession = await updateSessionUseCase(id, session.userId, parsed.data)
    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    if (error instanceof SessionNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }

    if (error instanceof InvalidSessionScheduleError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params

  try {
    await archiveSessionUseCase(id, session.userId)
    return NextResponse.json({})
  } catch (error) {
    if (error instanceof SessionNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }

    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
