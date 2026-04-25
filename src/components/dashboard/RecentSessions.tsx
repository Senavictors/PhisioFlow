import { StatusBadge } from '@/components/sessions/StatusBadge'
import type { SessionStatus } from '@/generated/prisma/client'
import { formatTimePtBr, formatDateLongPtBr } from '@/lib/date'
import { formatTreatmentPlanLabel } from '@/lib/clinical-labels'

interface RecentSessionItem {
  id: string
  patientName: string
  attendanceType: string
  treatmentPlan: { area: string; specialties: string[] } | null
  date: string
  status: SessionStatus
  isHomeCare: boolean
}

export function RecentSessions({ sessions }: { sessions: RecentSessionItem[] }) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <p className="font-display text-[20px] font-bold text-foreground">Atendimentos recentes</p>

      {sessions.length === 0 ? (
        <p className="mt-8 text-center font-body text-[13px] text-muted-foreground">
          Nenhum atendimento registrado ainda.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate font-body text-[15px] font-semibold text-foreground">
                  {s.patientName}
                </p>
                <p className="mt-0.5 font-body text-[12.5px] text-muted-foreground">
                  {formatTreatmentPlanLabel(s.treatmentPlan ?? undefined)} ·{' '}
                  {formatTimePtBr(s.date)} · {formatDateLongPtBr(s.date)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {s.isHomeCare ? (
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 font-body text-[11px] font-semibold text-accent-soft-fg">
                    Domiciliar
                  </span>
                ) : null}
                <StatusBadge status={s.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
