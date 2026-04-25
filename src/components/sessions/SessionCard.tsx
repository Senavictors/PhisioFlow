'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { CalendarDays, Check, Clock3, Home, MapPin, Pencil, UserRound, X } from 'lucide-react'
import type { SessionStatus, SessionType } from '@/generated/prisma/client'
import { formatDateLongPtBr, formatTimePtBr } from '@/lib/date'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/sessions/StatusBadge'
import { SESSION_TYPE_LABELS } from '@/components/sessions/session-meta'
import { SendSessionReminderButton } from '@/components/sessions/SendSessionReminderButton'
import { CalendarSyncBadge } from '@/components/calendar/CalendarSyncBadge'
import { SyncSessionCalendarButton } from '@/components/calendar/SyncSessionCalendarButton'

interface SessionCardProps {
  session: {
    id: string
    date: Date | string
    duration: number
    type: SessionType
    status: SessionStatus
    subjective?: string | null
    objective?: string | null
    assessment?: string | null
    plan?: string | null
    calendarEventLinks?: Array<{
      id: string
      status: string
      calendarId: string
      externalEventId: string
      errorMessage?: string | null
      lastSyncedAt?: Date | string | null
    }>
    patient: {
      id: string
      name: string
      area?: string
      homeCarePriority?: string | null
      address?: string | null
      neighborhood?: string | null
      city?: string | null
      email?: string | null
    }
  }
  showDate?: boolean
  allowStatusActions?: boolean
  showAddress?: boolean
}

function getSessionSummary(session: SessionCardProps['session']) {
  return [session.subjective, session.objective, session.assessment, session.plan].find(
    (value) => typeof value === 'string' && value.trim().length > 0
  )
}

export function SessionCard({
  session,
  showDate = false,
  allowStatusActions = true,
  showAddress = false,
}: SessionCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const summary = getSessionSummary(session)
  const calendarLink = session.calendarEventLinks?.[0]

  async function updateStatus(nextStatus: Extract<SessionStatus, 'REALIZADO' | 'CANCELADO'>) {
    const response = await fetch(`/api/sessions/${session.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })

    if (response.ok) {
      router.refresh()
    }
  }

  function handleStatusUpdate(nextStatus: Extract<SessionStatus, 'REALIZADO' | 'CANCELADO'>) {
    startTransition(() => {
      void updateStatus(nextStatus)
    })
  }

  return (
    <article className="rounded-[20px] border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-[112px] shrink-0 flex-col rounded-[18px] bg-primary-soft/80 px-4 py-3 text-left">
            <span className="font-display text-[28px] font-bold leading-none text-primary sm:text-[30px]">
              {formatTimePtBr(session.date)}
            </span>
            <span className="mt-2 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-soft-fg">
              {session.duration} min
            </span>
            {showDate ? (
              <span className="mt-2 font-body text-[12px] text-primary-soft-fg">
                {formatDateLongPtBr(session.date)}
              </span>
            ) : null}
          </div>

          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/pacientes/${session.patient.id}`}
                className="font-display text-[24px] font-bold leading-tight text-foreground transition-colors hover:text-primary"
              >
                {session.patient.name}
              </Link>
              {session.type === 'HOME_CARE' ? (
                <span className="rounded-full bg-accent-soft px-2.5 py-1 font-body text-[11px] font-semibold text-accent-soft-fg">
                  Domiciliar
                </span>
              ) : null}
              {session.type === 'HOME_CARE' && session.patient.homeCarePriority === 'URGENT' ? (
                <span className="rounded-full bg-[var(--color-accent)] px-2.5 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-white">
                  Urgente
                </span>
              ) : session.type === 'HOME_CARE' && session.patient.homeCarePriority === 'HIGH' ? (
                <span className="rounded-full bg-warning-soft px-2.5 py-1 font-body text-[11px] font-semibold text-warning">
                  Prioritário
                </span>
              ) : null}
              <StatusBadge status={session.status} />
              <CalendarSyncBadge status={calendarLink?.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-body text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                {SESSION_TYPE_LABELS[session.type]}
              </span>
              {!showDate ? (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDateLongPtBr(session.date)}
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                {session.type === 'HOME_CARE' ? (
                  <Home className="h-3.5 w-3.5" />
                ) : (
                  <UserRound className="h-3.5 w-3.5" />
                )}
                {session.type === 'HOME_CARE' ? 'Visita clínica' : 'Sessão em clínica'}
              </span>
              {showAddress && session.patient.address ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {[session.patient.address, session.patient.neighborhood, session.patient.city]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              ) : null}
            </div>

            {summary ? (
              <p className="max-w-[720px] font-body text-[13px] leading-relaxed text-muted-foreground">
                {summary}
              </p>
            ) : (
              <p className="font-body text-[13px] leading-relaxed text-muted-foreground">
                SOAP ainda sem conteúdo detalhado para esta sessão.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row xl:min-w-[188px] xl:flex-col xl:items-stretch">
          {allowStatusActions && session.status === 'AGENDADO' ? (
            <>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleStatusUpdate('REALIZADO')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5',
                  'font-body text-[13px] font-semibold text-primary-foreground shadow-glow',
                  'transition-colors duration-[180ms] hover:bg-primary-hover disabled:opacity-60'
                )}
              >
                <Check className="h-4 w-4" />
                Confirmar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleStatusUpdate('CANCELADO')}
                className="flex items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-2.5 font-body text-[13px] font-semibold text-danger transition-colors duration-[180ms] hover:border-danger/50 hover:bg-danger hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
              <SendSessionReminderButton
                sessionId={session.id}
                patientHasEmail={Boolean(session.patient.email)}
              />
            </>
          ) : null}

          {session.status === 'AGENDADO' ? (
            <SyncSessionCalendarButton
              sessionId={session.id}
              currentStatus={calendarLink?.status}
            />
          ) : null}

          <Link
            href={`/atendimentos/${session.id}/editar`}
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 font-body text-[13px] font-semibold text-foreground transition-colors duration-[180ms] hover:border-primary/40 hover:bg-primary-soft"
          >
            <Pencil className="h-4 w-4" />
            Editar SOAP
          </Link>

          <Link
            href={`/pacientes/${session.patient.id}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 font-body text-[13px] font-semibold text-foreground transition-colors duration-[180ms] hover:border-primary/40 hover:bg-primary-soft"
          >
            Abrir paciente
          </Link>
        </div>
      </div>
    </article>
  )
}
