import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { updateWorkplaceDTO } from '@/server/modules/workplaces/http/workplace.dto'
import { WorkplaceNotFoundError, getWorkplaceUseCase } from '@/server/modules/workplaces/application/get-workplace'
import { updateWorkplaceUseCase } from '@/server/modules/workplaces/application/update-workplace'
import { archiveWorkplaceUseCase } from '@/server/modules/workplaces/application/archive-workplace'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params

  try {
    const workplace = await getWorkplaceUseCase(id, session.userId)
    return NextResponse.json({ workplace })
  } catch (error) {
    if (error instanceof WorkplaceNotFoundError) {
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
  const parsed = updateWorkplaceDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const workplace = await updateWorkplaceUseCase(id, session.userId, parsed.data)
    return NextResponse.json({ workplace })
  } catch (error) {
    if (error instanceof WorkplaceNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
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
    const workplace = await archiveWorkplaceUseCase(id, session.userId)
    return NextResponse.json({ workplace })
  } catch (error) {
    if (error instanceof WorkplaceNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
