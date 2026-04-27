import { Mail } from 'lucide-react'
import { getSession } from '@/lib/session'
import { getEmailSettingsUseCase } from '@/server/modules/email/application/get-email-settings'
import { EmailSettingsForm } from '@/components/settings/EmailSettingsForm'
import { GmailAppPasswordGuide } from '@/components/settings/GmailAppPasswordGuide'

export const dynamic = 'force-dynamic'

export default async function EmailSettingsPage() {
  const session = await getSession()
  const settings = session.userId ? await getEmailSettingsUseCase(session.userId) : null

  return (
    <div className="max-w-[1100px] space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-2">
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Configurações
        </p>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Mail className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-display text-[28px] font-bold leading-tight text-foreground sm:text-[34px]">
              E-mail
            </h1>
            <p className="mt-1 font-body text-[14px] text-muted-foreground">
              Conecte seu Gmail para enviar documentos e avisos de atendimento direto pelo
              PhysioFlow.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <EmailSettingsForm initialSettings={settings} />
        <GmailAppPasswordGuide />
      </div>
    </div>
  )
}
