import Link from 'next/link'
import { CalendarCheck2, CalendarDays, Home } from 'lucide-react'
import { getSession } from '@/lib/session'
import { formatAgendaDayLabel, formatCalendarDateKey } from '@/lib/date'
import { SessionCard } from '@/components/sessions/SessionCard'
import { DomiciliarToggle } from '@/components/agenda/DomiciliarToggle'
import { listSessionsUseCase } from '@/server/modules/sessions/application/list-sessions'

const PRIORITY_ORDER: Record<string, number> = { URGENT: 0, HIGH: 1, NORMAL: 2 }

function sortByPriority<
  T extends { patient: { homeCarePriority?: string | null }; date: Date | string },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.patient.homeCarePriority ?? 'NORMAL'] ?? 2
    const pb = PRIORITY_ORDER[b.patient.homeCarePriority ?? 'NORMAL'] ?? 2
    if (pa !== pb) return pa - pb
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ domiciliar?: string }>
}) {
  const { domiciliar } = await searchParams
  const isHomeCareMode = domiciliar === '1'

  const session = await getSession()
  const { sessions } = await listSessionsUseCase(session.userId!, {
    status: 'AGENDADO',
    from: new Date().toISOString(),
    limit: 100,
    order: 'asc',
    ...(isHomeCareMode ? { type: 'HOME_CARE' } : {}),
  })

  const homeCareCount = sessions.filter((item) => item.type === 'HOME_CARE').length

  const groupedSessions = sessions.reduce<
    Array<{ key: string; label: string; items: typeof sessions }>
  >((groups, item) => {
    const key = formatCalendarDateKey(item.date)
    const existingGroup = groups.find((group) => group.key === key)

    if (existingGroup) {
      existingGroup.items.push(item)
      return groups
    }

    groups.push({
      key,
      label: formatAgendaDayLabel(item.date),
      items: [item],
    })

    return groups
  }, [])

  if (isHomeCareMode) {
    groupedSessions.forEach((group) => {
      group.items = sortByPriority(group.items)
    })
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {isHomeCareMode ? 'Atendimentos Domiciliares' : 'Próximos'}
          </p>
          <h1 className="font-display text-[30px] font-bold leading-tight text-foreground sm:text-[36px]">
            Agenda
          </h1>
          <p className="mt-1 font-body text-[14px] text-muted-foreground">
            {isHomeCareMode
              ? 'Visitas domiciliares ordenadas por prioridade.'
              : 'Agendamentos e atendimentos domiciliares.'}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <DomiciliarToggle active={isHomeCareMode} />
          <Link
            href="/pacientes"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover"
          >
            <CalendarDays className="h-4 w-4" />
            Novo agendamento
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-[18px] border border-border bg-card p-4 shadow-sm">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Próximas sessões
          </p>
          <p className="mt-3 font-display text-[32px] font-bold text-foreground">
            {sessions.length}
          </p>
        </div>
        <div className="rounded-[18px] border border-border bg-card p-4 shadow-sm">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Domiciliares
          </p>
          <p className="mt-3 font-display text-[32px] font-bold text-foreground">{homeCareCount}</p>
        </div>
      </div>

      {groupedSessions.length === 0 ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-border bg-card/75 px-6 py-12 sm:px-10">
          <div className="flex max-w-[430px] flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
              <CalendarCheck2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-display text-[22px] font-bold text-foreground">
                {isHomeCareMode
                  ? 'Nenhum atendimento domiciliar'
                  : 'Nenhum agendamento futuro'}
              </p>
              <p className="mt-1 font-body text-[14px] text-muted-foreground">
                {isHomeCareMode
                  ? 'Não há visitas domiciliares agendadas para os próximos dias.'
                  : 'Crie um novo atendimento a partir da ficha do paciente para preencher sua agenda.'}
              </p>
            </div>
            <Link
              href="/pacientes"
              className="w-full rounded-xl bg-primary px-5 py-2.5 text-center font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover sm:w-auto"
            >
              Abrir pacientes
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedSessions.map((group) => (
            <section key={group.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent-soft px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-soft-fg">
                  {group.label}
                </span>
                {!isHomeCareMode && group.items.some((item) => item.type === 'HOME_CARE') ? (
                  <span className="flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 font-body text-[11px] font-semibold text-primary-soft-fg">
                    <Home className="h-3.5 w-3.5" />
                    Inclui domiciliar
                  </span>
                ) : null}
              </div>

              <div className="space-y-3">
                {group.items.map((item) => (
                  <SessionCard
                    key={item.id}
                    session={item}
                    allowStatusActions
                    showAddress={isHomeCareMode}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
