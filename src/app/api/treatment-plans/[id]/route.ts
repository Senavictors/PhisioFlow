import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  TreatmentPlanNotFoundError,
  WorkplaceForPlanNotFoundError,
} from '@/server/modules/treatment-plans/domain/treatment-plan'
import { getTreatmentPlanUseCase } from '@/server/modules/treatment-plans/application/get-treatment-plan'
import { updateTreatmentPlanUseCase } from '@/server/modules/treatment-plans/application/update-treatment-plan'
import { cancelTreatmentPlanUseCase } from '@/server/modules/treatment-plans/application/change-status'
import { updateTreatmentPlanDTO } from '@/server/modules/treatment-plans/http/treatment-plan.dto'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  try {
    const plan = await getTreatmentPlanUseCase(id, session.userId)
    return NextResponse.json({ plan })
  } catch (error) {
    if (error instanceof TreatmentPlanNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const parsed = updateTreatmentPlanDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const plan = await updateTreatmentPlanUseCase(id, session.userId, parsed.data)
    return NextResponse.json({ plan })
  } catch (error) {
    if (error instanceof TreatmentPlanNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    if (error instanceof WorkplaceForPlanNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  try {
    const plan = await cancelTreatmentPlanUseCase(id, session.userId)
    return NextResponse.json({ plan })
  } catch (error) {
    if (error instanceof TreatmentPlanNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
