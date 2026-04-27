import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { TreatmentPlanNotFoundError } from '@/server/modules/treatment-plans/domain/treatment-plan'
import { registerPaymentDTO } from '@/server/modules/payments/http/payment.dto'
import { registerPaymentUseCase } from '@/server/modules/payments/application/register-payment'
import { InvalidPaymentTargetError } from '@/server/modules/payments/domain/payment'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const parsed = registerPaymentDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const payment = await registerPaymentUseCase({
      userId: session.userId,
      treatmentPlanId: id,
      dto: parsed.data,
    })
    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    if (error instanceof TreatmentPlanNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    if (error instanceof InvalidPaymentTargetError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
