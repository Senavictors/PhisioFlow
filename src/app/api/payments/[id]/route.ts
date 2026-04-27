import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { PaymentNotFoundError } from '@/server/modules/payments/domain/payment'
import { updatePaymentDTO } from '@/server/modules/payments/http/payment.dto'
import {
  updatePaymentUseCase,
  voidPaymentUseCase,
} from '@/server/modules/payments/application/update-payment'

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const parsed = updatePaymentDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const payment = await updatePaymentUseCase(id, session.userId, parsed.data)
    return NextResponse.json({ payment })
  } catch (error) {
    if (error instanceof PaymentNotFoundError) {
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
    const payment = await voidPaymentUseCase(id, session.userId)
    return NextResponse.json({ payment })
  } catch (error) {
    if (error instanceof PaymentNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
