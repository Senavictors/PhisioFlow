import Link from 'next/link'
import { CalendarDays, ClipboardList, FilePlus2 } from 'lucide-react'
import { getSession } from '@/lib/session'
import { SessionCard } from '@/components/sessions/SessionCard'
import { listSessionsUseCase } from '@/server/modules/sessions/application/list-sessions'
import { serializeSession } from '@/lib/serialize-session'

export default async function AtendimentosPage() {
  const session = await getSession()
  const { sessions: rawSessions, total } = await listSessionsUseCase(session.userId!, {
    limit: 100,
    order: 'desc',
  })
  const sessions = rawSessions.map(serializeSession)
  const completedCount = sessions.filter((item) => item.status === 'REALIZADO').length
  const scheduledCount = sessions.filter((item) => item.status === 'AGENDADO').length

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Histórico
          </p>
          <h1 className="font-display text-[30px] font-bold leading-tight text-foreground sm:text-[36px]">
            Atendimentos
          </h1>
          <p className="mt-1 font-body text-[14px] text-muted-foreground">
            Histórico cronológico das suas sessões.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/agenda"
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 font-body text-[13px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft"
          >
            <CalendarDays className="h-4 w-4" />
            Ver agenda
          </Link>
          <Link
            href="/pacientes"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover"
          >
            <FilePlus2 className="h-4 w-4" />
            Novo atendimento
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-[18px] border border-border bg-card p-4 shadow-sm">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Total
          </p>
          <p className="mt-3 font-display text-[32px] font-bold text-foreground">{total}</p>
        </div>
        <div className="rounded-[18px] border border-border bg-card p-4 shadow-sm">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Realizados
          </p>
          <p className="mt-3 font-display text-[32px] font-bold text-foreground">
            {completedCount}
          </p>
        </div>
        <div className="rounded-[18px] border border-border bg-card p-4 shadow-sm">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Agendados
          </p>
          <p className="mt-3 font-display text-[32px] font-bold text-foreground">
            {scheduledCount}
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-border bg-card/75 px-6 py-12 sm:px-10">
          <div className="flex max-w-[430px] flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-display text-[22px] font-bold text-foreground">
                Nenhum atendimento registrado ainda
              </p>
              <p className="mt-1 font-body text-[14px] text-muted-foreground">
                Vá até um paciente para registrar a primeira sessão SOAP.
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
        <div className="space-y-3">
          {sessions.map((item) => (
            <SessionCard key={item.id} session={item} showDate />
          ))}
        </div>
      )}
    </div>
  )
}
