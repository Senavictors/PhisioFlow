import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { createDocumentDTO, listDocumentsDTO } from '@/server/modules/documents/http/document.dto'
import { PatientNotFoundError } from '@/server/modules/patients/application/get-patient'
import { createDocumentUseCase } from '@/server/modules/documents/application/create-document'
import { listDocumentsUseCase } from '@/server/modules/documents/application/list-documents'

export async function GET(request: Request) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = listDocumentsDTO.safeParse({
    patientId: searchParams.get('patientId') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    page: searchParams.get('page') ?? '1',
    limit: searchParams.get('limit') ?? '20',
  })

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const result = await listDocumentsUseCase(session.userId, parsed.data)
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createDocumentDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const document = await createDocumentUseCase(session.userId, parsed.data)
    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    if (error instanceof PatientNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
