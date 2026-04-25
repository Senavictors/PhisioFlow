import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { PatientNotFoundError } from '@/server/modules/patients/application/get-patient'
import {
  createTreatmentPlanDTO,
  listTreatmentPlansDTO,
} from '@/server/modules/treatment-plans/http/treatment-plan.dto'
import { createTreatmentPlanUseCase } from '@/server/modules/treatment-plans/application/create-treatment-plan'
import { listPatientTreatmentPlansUseCase } from '@/server/modules/treatment-plans/application/list-treatment-plans'
import { WorkplaceForPlanNotFoundError } from '@/server/modules/treatment-plans/domain/treatment-plan'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const parsed = listTreatmentPlansDTO.safeParse({
    status: searchParams.get('status') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const result = await listPatientTreatmentPlansUseCase(session.userId, id, parsed.data)
  return NextResponse.json(result)
}

export async function POST(request: Request, { params }: Params) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = createTreatmentPlanDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const plan = await createTreatmentPlanUseCase(session.userId, id, parsed.data)
    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    if (error instanceof PatientNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    if (error instanceof WorkplaceForPlanNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
