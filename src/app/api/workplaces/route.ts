import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { createWorkplaceDTO, listWorkplacesDTO } from '@/server/modules/workplaces/http/workplace.dto'
import { createWorkplaceUseCase } from '@/server/modules/workplaces/application/create-workplace'
import { listWorkplacesUseCase } from '@/server/modules/workplaces/application/list-workplaces'

export async function GET(request: Request) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = listWorkplacesDTO.safeParse({
    includeArchived: searchParams.get('includeArchived') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const result = await listWorkplacesUseCase(session.userId, parsed.data)
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createWorkplaceDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const workplace = await createWorkplaceUseCase(session.userId, parsed.data)
  return NextResponse.json({ workplace }, { status: 201 })
}
