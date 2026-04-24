import type { SessionStatus } from '@/generated/prisma/client'
import { cn } from '@/lib/utils'
import { SESSION_STATUS_LABELS } from '@/components/sessions/session-meta'

const statusClasses: Record<SessionStatus, string> = {
  AGENDADO: 'bg-primary-soft text-primary-soft-fg',
  REALIZADO: 'bg-success-soft text-success',
  CANCELADO: 'bg-muted text-muted-foreground',
}

export function StatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 font-body text-[11px] font-semibold',
        statusClasses[status]
      )}
    >
      {SESSION_STATUS_LABELS[status]}
    </span>
  )
}
