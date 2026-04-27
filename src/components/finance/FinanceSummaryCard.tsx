import { cn } from '@/lib/utils'

interface FinanceSummaryCardProps {
  label: string
  value: string
  delta?: string
  variant?: 'received' | 'forecast'
}

const VARIANT_CLASSES = {
  received: 'bg-success-soft text-success',
  forecast: 'bg-warning-soft text-warning',
} as const

export function FinanceSummaryCard({
  label,
  value,
  delta,
  variant = 'received',
}: FinanceSummaryCardProps) {
  return (
    <div className="rounded-[18px] border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        {delta ? (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-body text-[10.5px] font-semibold',
              VARIANT_CLASSES[variant]
            )}
          >
            {delta}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-[26px] font-bold text-foreground sm:text-[28px]">
        {value}
      </p>
    </div>
  )
}
