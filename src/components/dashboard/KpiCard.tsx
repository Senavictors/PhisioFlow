import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  icon: LucideIcon
  value: number
  label: string
  sub?: string
  variant?: 'default' | 'accent'
  urgent?: boolean
}

export function KpiCard({ icon: Icon, value, label, sub, variant = 'default', urgent = false }: KpiCardProps) {
  return (
    <div className="relative rounded-2xl bg-card p-6 shadow-sm">
      {urgent ? (
        <span className="absolute right-4 top-4 font-body text-[10.5px] font-bold uppercase tracking-[0.16em] text-accent-soft-fg">
          Urgente
        </span>
      ) : null}

      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl',
          variant === 'accent'
            ? 'bg-accent-soft text-accent-soft-fg'
            : 'bg-primary-soft text-primary-soft-fg'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 font-display text-[68px] leading-none tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 font-body text-[15px] font-semibold text-foreground">{label}</p>
      {sub ? (
        <p className="mt-0.5 font-body text-[13px] text-muted-foreground">{sub}</p>
      ) : null}
    </div>
  )
}
