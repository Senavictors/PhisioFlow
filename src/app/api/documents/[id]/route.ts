import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { DocumentNotFoundError } from '@/server/modules/documents/domain/document'
import { deleteDocumentUseCase } from '@/server/modules/documents/application/delete-document'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params

  try {
    await deleteDocumentUseCase(id, session.userId)
    return NextResponse.json({})
  } catch (error) {
    if (error instanceof DocumentNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
