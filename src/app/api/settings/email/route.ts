import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getEmailSettingsUseCase } from '@/server/modules/email/application/get-email-settings'
import { saveEmailSettingsUseCase } from '@/server/modules/email/application/save-email-settings'
import { updateEmailSettingsDTO } from '@/server/modules/email/http/email.dto'

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const settings = await getEmailSettingsUseCase(session.userId)
  return NextResponse.json({ settings })
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = updateEmailSettingsDTO.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    await saveEmailSettingsUseCase(session.userId, parsed.data)
    const settings = await getEmailSettingsUseCase(session.userId)
    return NextResponse.json({ settings })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ message }, { status: 400 })
  }
}
