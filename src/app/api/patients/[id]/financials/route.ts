import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getPatientFinancialsUseCase } from '@/server/modules/payments/application/get-patient-financials'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const financials = await getPatientFinancialsUseCase(id, session.userId)
  return NextResponse.json(financials)
}
