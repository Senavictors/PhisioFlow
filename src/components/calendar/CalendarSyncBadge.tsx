import { CalendarCheck2, CalendarClock, CalendarX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarSyncBadgeProps {
  status?: 'SYNCED' | 'FAILED' | 'REMOVED' | string | null
}

export function CalendarSyncBadge({ status }: CalendarSyncBadgeProps) {
  const Icon =
    status === 'SYNCED' ? CalendarCheck2 : status === 'FAILED' ? CalendarX : CalendarClock
  const label =
    status === 'SYNCED'
      ? 'Google Calendar'
      : status === 'FAILED'
        ? 'Sync falhou'
        : status === 'REMOVED'
          ? 'Removido do Calendar'
          : 'Não sincronizado'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-body text-[11px] font-semibold',
        status === 'SYNCED'
          ? 'bg-success-soft text-success'
          : status === 'FAILED'
            ? 'bg-danger-soft text-danger'
            : 'bg-muted text-muted-foreground'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
