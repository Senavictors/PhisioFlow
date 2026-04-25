import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { DocumentNotFoundError } from '@/server/modules/documents/domain/document'
import { getDocumentForDownloadUseCase } from '@/server/modules/documents/application/get-document'
import { renderDocumentPDF } from '@/lib/pdf/render'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()

  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params

  try {
    const doc = await getDocumentForDownloadUseCase(id, session.userId)

    if (!doc) {
      return NextResponse.json({ message: 'Documento não encontrado' }, { status: 404 })
    }

    const buffer = await renderDocumentPDF({
      type: doc.type,
      userName: doc.user?.name ?? 'Fisioterapeuta',
      patient: {
        name: doc.patient.name,
        birthDate: doc.patient.birthDate,
        phone: doc.patient.phone ?? undefined,
        area: doc.patient.area,
        classification: doc.patient.classification,
        clinicalRecord: doc.patient.clinicalRecord ?? undefined,
      },
      period: doc.period ?? undefined,
      sessions: (doc.patient.sessions ?? []).map((s) => ({
        date: s.date,
        status: s.status,
        assessment: s.assessment,
        plan: s.plan,
        subjective: s.subjective,
        objective: s.objective,
      })),
    })

    const fileName = encodeURIComponent(doc.title) + '.pdf'

    const uint8 = new Uint8Array(buffer)
    return new Response(uint8, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${fileName}`,
        'Content-Length': uint8.byteLength.toString(),
      },
    })
  } catch (error) {
    if (error instanceof DocumentNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    return NextResponse.json({ message: 'Erro ao gerar PDF' }, { status: 500 })
  }
}
