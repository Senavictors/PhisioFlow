import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { sendTestEmailUseCase } from '@/server/modules/email/application/send-test-email'
import { sendTestEmailDTO } from '@/server/modules/email/http/email.dto'
import {
  EmailDeliveryError,
  EmailSettingsNotConfiguredError,
} from '@/server/modules/email/domain/errors'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = sendTestEmailDTO.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const result = await sendTestEmailUseCase(session.userId, parsed.data)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof EmailSettingsNotConfiguredError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    if (error instanceof EmailDeliveryError) {
      return NextResponse.json({ message: error.message }, { status: 502 })
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
