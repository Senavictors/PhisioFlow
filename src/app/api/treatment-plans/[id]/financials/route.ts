import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { TreatmentPlanNotFoundError } from '@/server/modules/treatment-plans/domain/treatment-plan'
import { getTreatmentPlanFinancialsUseCase } from '@/server/modules/payments/application/get-plan-financials'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  try {
    const financials = await getTreatmentPlanFinancialsUseCase(id, session.userId)
    return NextResponse.json(financials)
  } catch (error) {
    if (error instanceof TreatmentPlanNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
