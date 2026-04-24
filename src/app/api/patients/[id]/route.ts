import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { updatePatientDTO } from '@/server/modules/patients/http/patient.dto'
import { PatientEmailAlreadyExistsError } from '@/server/modules/patients/application/create-patient'
import {
  getPatientUseCase,
  PatientNotFoundError,
} from '@/server/modules/patients/application/get-patient'
import { updatePatientUseCase } from '@/server/modules/patients/application/update-patient'
import { archivePatientUseCase } from '@/server/modules/patients/application/archive-patient'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  try {
    const patient = await getPatientUseCase(id, session.userId)
    return NextResponse.json({ patient })
  } catch (err) {
    if (err instanceof PatientNotFoundError) {
      return NextResponse.json({ message: err.message }, { status: 404 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const parsed = updatePatientDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const patient = await updatePatientUseCase(id, session.userId, parsed.data)
    return NextResponse.json({ patient })
  } catch (err) {
    if (err instanceof PatientNotFoundError) {
      return NextResponse.json({ message: err.message }, { status: 404 })
    }
    if (err instanceof PatientEmailAlreadyExistsError) {
      return NextResponse.json({ message: err.message }, { status: 409 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

  const { id } = await params

  try {
    await archivePatientUseCase(id, session.userId)
    return NextResponse.json({})
  } catch (err) {
    if (err instanceof PatientNotFoundError) {
      return NextResponse.json({ message: err.message }, { status: 404 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
