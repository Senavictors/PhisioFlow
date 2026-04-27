'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PresetOption {
  key: string
  label: string
}

const PRESETS: PresetOption[] = [
  { key: 'today', label: 'Hoje' },
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: 'month', label: 'Este mês' },
  { key: 'last-month', label: 'Mês anterior' },
]

const GRANULARITY_OPTIONS = [
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
] as const

interface FinancePeriodPickerProps {
  preset: string
  granularity: 'day' | 'week' | 'month'
}

export function FinancePeriodPicker({ preset, granularity }: FinancePeriodPickerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString())
    next.set(key, value)
    router.push(`/financeiro?${next.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[18px] border border-border bg-card p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Período
        </span>
        {PRESETS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setParam('preset', option.key)}
            className={cn(
              'rounded-full px-3 py-1.5 font-body text-[12px] font-semibold transition-colors',
              preset === option.key
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'bg-muted text-muted-foreground hover:bg-primary-soft hover:text-primary-soft-fg'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Agrupar
        </span>
        {GRANULARITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setParam('granularity', option.value)}
            className={cn(
              'rounded-full px-3 py-1.5 font-body text-[12px] font-semibold transition-colors',
              granularity === option.value
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'bg-muted text-muted-foreground hover:bg-primary-soft hover:text-primary-soft-fg'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
