import { Home } from 'lucide-react'
import type { SessionStatus, SessionType } from '@/generated/prisma/client'
import { formatDateLongPtBr, formatTimePtBr } from '@/lib/date'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/sessions/StatusBadge'
import { SoapAccordion } from '@/components/timeline/SoapAccordion'

const dotClasses: Record<SessionStatus, string> = {
  REALIZADO: 'bg-success ring-success-soft',
  AGENDADO: 'bg-primary ring-primary-soft',
  CANCELADO: 'bg-muted ring-border',
}

interface TimelineEntryProps {
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
  }
  isLast?: boolean
}

export function TimelineEntry({ session, isLast = false }: TimelineEntryProps) {
  const hasContent = [session.subjective, session.objective, session.assessment, session.plan].some(
    v => v && v.trim().length > 0
  )
  const defaultOpen = session.status === 'REALIZADO' && hasContent

  return (
    <div className="relative flex gap-4 pb-6">
      {/* linha vertical */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 h-full w-0.5 bg-border" aria-hidden="true" />
      )}

      {/* dot */}
      <div
        className={cn(
          'relative z-10 mt-0.5 h-8 w-8 shrink-0 rounded-full ring-4',
          dotClasses[session.status]
        )}
      />

      {/* card */}
      <div className="flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-[18px] font-bold leading-tight text-foreground">
              {formatDateLongPtBr(session.date)}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-[12px] text-muted-foreground">
              <span>{formatTimePtBr(session.date)}</span>
              <span>·</span>
              <span>{session.duration} min</span>
              {session.type === 'HOME_CARE' && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    Domiciliar
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session.type === 'HOME_CARE' && (
              <span className="rounded-full bg-accent-soft px-2.5 py-1 font-body text-[11px] font-semibold text-accent-soft-fg">
                Domiciliar
              </span>
            )}
            <StatusBadge status={session.status} />
          </div>
        </div>

        <SoapAccordion
          subjective={session.subjective}
          objective={session.objective}
          assessment={session.assessment}
          plan={session.plan}
          defaultOpen={defaultOpen}
        />
      </div>
    </div>
  )
}
