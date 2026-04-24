import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { createPatientDTO, listPatientsDTO } from '@/server/modules/patients/http/patient.dto'
import {
  createPatientUseCase,
  PatientEmailAlreadyExistsError,
} from '@/server/modules/patients/application/create-patient'
import { listPatientsUseCase } from '@/server/modules/patients/application/list-patients'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const parsed = listPatientsDTO.safeParse({
    area: searchParams.get('area') ?? undefined,
    classification: searchParams.get('classification') ?? undefined,
    search: searchParams.get('search') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const patients = await listPatientsUseCase(session.userId, parsed.data)
  return NextResponse.json({ patients })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const parsed = createPatientDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const patient = await createPatientUseCase(session.userId, parsed.data)
    return NextResponse.json({ patient }, { status: 201 })
  } catch (err) {
    if (err instanceof PatientEmailAlreadyExistsError) {
      return NextResponse.json({ message: err.message }, { status: 409 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
