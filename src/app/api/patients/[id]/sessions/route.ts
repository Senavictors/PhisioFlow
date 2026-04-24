import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getPatientUseCase, PatientNotFoundError } from '@/server/modules/patients/application/get-patient'
import { listSessionsUseCase } from '@/server/modules/sessions/application/list-sessions'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  try {
    await getPatientUseCase(id, session.userId)
  } catch (err) {
    if (err instanceof PatientNotFoundError) {
      return NextResponse.json({ message: 'Paciente não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '20')))

  const result = await listSessionsUseCase(session.userId, {
    patientId: id,
    page,
    limit,
    order: 'desc',
  })

  return NextResponse.json(result)
}
