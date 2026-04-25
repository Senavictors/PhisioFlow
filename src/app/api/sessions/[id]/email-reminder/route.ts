import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { sendSessionReminderEmailUseCase } from '@/server/modules/email/application/send-session-reminder'
import { sendEmailMessageDTO } from '@/server/modules/email/http/email.dto'
import {
  EmailDeliveryError,
  EmailSettingsNotConfiguredError,
  PatientEmailMissingError,
} from '@/server/modules/email/domain/errors'
import { SessionNotFoundError } from '@/server/modules/sessions/application/get-session'

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
    const email = await sendSessionReminderEmailUseCase({
      userId: session.userId,
      sessionId: id,
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
    if (error instanceof SessionNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }
    if (error instanceof EmailDeliveryError) {
      return NextResponse.json({ message: error.message }, { status: 502 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
