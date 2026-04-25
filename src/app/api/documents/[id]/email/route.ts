import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { sendDocumentEmailUseCase } from '@/server/modules/email/application/send-document-email'
import { sendEmailMessageDTO } from '@/server/modules/email/http/email.dto'
import {
  EmailDeliveryError,
  EmailSettingsNotConfiguredError,
  PatientEmailMissingError,
} from '@/server/modules/email/domain/errors'
import { DocumentNotFoundError } from '@/server/modules/documents/domain/document'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const parsed = sendEmailMessageDTO.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const email = await sendDocumentEmailUseCase({
      userId: session.userId,
      documentId: id,
      subject: parsed.data.subject,
      message: parsed.data.message,
    })
    return NextResponse.json({ email })
  } catch (error) {
    if (error instanceof EmailSettingsNotConfiguredError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    if (error instanceof PatientEmailMissingError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    if (error instanceof DocumentNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    if (error instanceof EmailDeliveryError) {
      return NextResponse.json({ message: error.message }, { status: 502 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
