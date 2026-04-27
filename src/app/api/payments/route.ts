import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { listPaymentsDTO } from '@/server/modules/payments/http/payment.dto'
import { listPaymentsUseCase } from '@/server/modules/payments/application/list-payments'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const parsed = listPaymentsDTO.safeParse({
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    patientId: searchParams.get('patientId') ?? undefined,
    planId: searchParams.get('planId') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const result = await listPaymentsUseCase(session.userId, parsed.data)
  return NextResponse.json(result)
}
