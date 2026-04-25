import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { TreatmentPlanNotFoundError } from '@/server/modules/treatment-plans/domain/treatment-plan'
import { pauseTreatmentPlanUseCase } from '@/server/modules/treatment-plans/application/change-status'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  try {
    const plan = await pauseTreatmentPlanUseCase(id, session.userId)
    return NextResponse.json({ plan })
  } catch (error) {
    if (error instanceof TreatmentPlanNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
