import Link from 'next/link'
import { CalendarDays, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgendaViewToggleProps {
  view: 'list' | 'calendar'
  domiciliar: boolean
  month?: string
}

function buildHref(view: 'list' | 'calendar', domiciliar: boolean, month?: string) {
  const params = new URLSearchParams()
  if (view === 'calendar') params.set('view', 'calendar')
  if (domiciliar) params.set('domiciliar', '1')
  if (view === 'calendar' && month) params.set('month', month)
  const query = params.toString()
  return query ? `/agenda?${query}` : '/agenda'
}

export function AgendaViewToggle({ view, domiciliar, month }: AgendaViewToggleProps) {
  const options: Array<{
    value: 'list' | 'calendar'
    label: string
    icon: typeof List
  }> = [
    { value: 'list', label: 'Lista', icon: List },
    { value: 'calendar', label: 'Calendário', icon: CalendarDays },
  ]

  return (
    <div
      role="tablist"
      aria-label="Visualização da agenda"
      className="inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1"
    >
      {options.map(({ value, label, icon: Icon }) => {
        const active = view === value
        return (
          <Link
            key={value}
            href={buildHref(value, domiciliar, month)}
            role="tab"
            aria-selected={active}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-[12.5px] font-semibold transition-colors duration-[180ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
