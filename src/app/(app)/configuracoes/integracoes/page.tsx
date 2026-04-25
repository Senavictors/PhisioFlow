import { getSession } from '@/lib/session'
import { GoogleCalendarSettingsCard } from '@/components/calendar/GoogleCalendarSettingsCard'
import { getCalendarConnectionUseCase } from '@/server/modules/calendar/application/get-calendar-connection'

export default async function IntegracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ calendar?: string }>
}) {
  const session = await getSession()
  const { calendar } = await searchParams
  const connection = await getCalendarConnectionUseCase(session.userId!)

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          CONFIGURAÇÕES
        </p>
        <h1 className="font-display text-[30px] font-bold leading-tight text-foreground sm:text-[36px]">
          Integrações
        </h1>
        <p className="mt-1 font-body text-[14px] text-muted-foreground">
          Conecte serviços externos ao fluxo clínico.
        </p>
      </div>

      <GoogleCalendarSettingsCard initialConnection={connection} status={calendar} />
    </div>
  )
}
