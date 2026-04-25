import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { createSessionDTO, listSessionsDTO } from '@/server/modules/sessions/http/session.dto'
import { PatientNotFoundError } from '@/server/modules/patients/application/get-patient'
import { createSessionUseCase } from '@/server/modules/sessions/application/create-session'
import { listSessionsUseCase } from '@/server/modules/sessions/application/list-sessions'
import { InvalidSessionScheduleError } from '@/server/modules/sessions/domain/session'
import {
  TreatmentPlanInactiveError,
  TreatmentPlanNotFoundError,
} from '@/server/modules/treatment-plans/domain/treatment-plan'

export async function GET(request: Request) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = listSessionsDTO.safeParse({
    patientId: searchParams.get('patientId') ?? undefined,
    treatmentPlanId: searchParams.get('treatmentPlanId') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    attendanceType:
      searchParams.get('attendanceType') ??
      (searchParams.get('type') === 'HOME_CARE' ? 'HOME_CARE' : undefined),
    area: searchParams.get('area') ?? undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    page: searchParams.get('page') ?? '1',
    limit: searchParams.get('limit') ?? '20',
  })

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const result = await listSessionsUseCase(session.userId, parsed.data)
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createSessionDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const createdSession = await createSessionUseCase(session.userId, parsed.data)
    return NextResponse.json({ session: createdSession }, { status: 201 })
  } catch (error) {
    if (error instanceof PatientNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }

    if (error instanceof InvalidSessionScheduleError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    if (error instanceof TreatmentPlanNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }

    if (error instanceof TreatmentPlanInactiveError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
