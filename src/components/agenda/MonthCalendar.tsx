'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SessionCard } from '@/components/sessions/SessionCard'

type CalendarSession = {
  id: string
  date: Date | string
  duration: number
  type: 'PRESENTIAL' | 'HOME_CARE'
  status: 'AGENDADO' | 'REALIZADO' | 'CANCELADO'
  subjective?: string | null
  objective?: string | null
  assessment?: string | null
  plan?: string | null
  patient: {
    id: string
    name: string
    area?: string
    homeCarePriority?: string | null
    address?: string | null
    neighborhood?: string | null
    city?: string | null
  }
}

interface MonthCalendarProps {
  monthKey: string
  todayKey: string
  domiciliar: boolean
  sessionsByDay: Record<string, CalendarSession[]>
}

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const STATUS_COLORS: Record<string, string> = {
  AGENDADO: 'bg-primary',
  REALIZADO: 'bg-emerald-500',
  CANCELADO: 'bg-muted-foreground/40',
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function buildMonthGrid(monthKey: string) {
  const [yearStr, monthStr] = monthKey.split('-')
  const year = Number(yearStr)
  const monthIndex = Number(monthStr) - 1

  const firstOfMonth = new Date(Date.UTC(year, monthIndex, 1))
  const startWeekday = firstOfMonth.getUTCDay()
  const gridStart = new Date(firstOfMonth)
  gridStart.setUTCDate(firstOfMonth.getUTCDate() - startWeekday)

  const days: Array<{ key: string; day: number; isCurrentMonth: boolean }> = []
  for (let i = 0; i < 42; i++) {
    const cell = new Date(gridStart)
    cell.setUTCDate(gridStart.getUTCDate() + i)
    const cellYear = cell.getUTCFullYear()
    const cellMonth = cell.getUTCMonth()
    days.push({
      key: `${cellYear}-${pad(cellMonth + 1)}-${pad(cell.getUTCDate())}`,
      day: cell.getUTCDate(),
      isCurrentMonth: cellMonth === monthIndex,
    })
  }

  return days
}

function formatMonthLabel(monthKey: string) {
  const [yearStr, monthStr] = monthKey.split('-')
  const date = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, 1))
  const label = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function shiftMonth(monthKey: string, delta: number) {
  const [yearStr, monthStr] = monthKey.split('-')
  const date = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1 + delta, 1))
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`
}

function buildHref(month: string, domiciliar: boolean) {
  const params = new URLSearchParams()
  params.set('view', 'calendar')
  params.set('month', month)
  if (domiciliar) params.set('domiciliar', '1')
  return `/agenda?${params.toString()}`
}

export function MonthCalendar({
  monthKey,
  todayKey,
  domiciliar,
  sessionsByDay,
}: MonthCalendarProps) {
  const days = useMemo(() => buildMonthGrid(monthKey), [monthKey])
  const monthLabel = useMemo(() => formatMonthLabel(monthKey), [monthKey])
  const previousMonth = useMemo(() => shiftMonth(monthKey, -1), [monthKey])
  const nextMonth = useMemo(() => shiftMonth(monthKey, 1), [monthKey])

  const defaultSelected = useMemo(() => {
    if (sessionsByDay[todayKey]?.length && days.some((d) => d.key === todayKey)) {
      return todayKey
    }
    const firstWithSessions = days.find((d) => d.isCurrentMonth && sessionsByDay[d.key]?.length)
    if (firstWithSessions) return firstWithSessions.key
    const firstCurrent = days.find((d) => d.isCurrentMonth)
    return firstCurrent?.key ?? days[0]?.key ?? null
  }, [days, sessionsByDay, todayKey])

  const [selectedKey, setSelectedKey] = useState<string | null>(defaultSelected)
  const selectedSessions = selectedKey ? (sessionsByDay[selectedKey] ?? []) : []

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-[20px] border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={buildHref(previousMonth, domiciliar)}
            aria-label="Mês anterior"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <p className="font-display text-[18px] font-bold text-foreground">{monthLabel}</p>
          <Link
            href={buildHref(nextMonth, domiciliar)}
            aria-label="Próximo mês"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 font-body text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="px-1 py-1.5 text-center">
              {label}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((day) => {
            const sessions = sessionsByDay[day.key] ?? []
            const total = sessions.length
            const hasHomeCare = sessions.some((s) => s.type === 'HOME_CARE')
            const isToday = day.key === todayKey
            const isSelected = day.key === selectedKey

            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedKey(day.key)}
                aria-pressed={isSelected}
                className={cn(
                  'group relative flex min-h-[72px] flex-col items-stretch gap-1 rounded-xl border px-1.5 py-1.5 text-left transition-colors duration-[150ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[88px] sm:px-2',
                  isSelected
                    ? 'border-primary bg-primary-soft'
                    : 'border-transparent hover:border-border hover:bg-muted/60',
                  !day.isCurrentMonth && 'opacity-45'
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'font-body text-[12px] font-semibold',
                      isToday
                        ? 'flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground'
                        : 'text-foreground'
                    )}
                  >
                    {day.day}
                  </span>
                  {hasHomeCare ? (
                    <Home
                      className="h-3 w-3 text-accent"
                      strokeWidth={2}
                      aria-label="Inclui domiciliar"
                    />
                  ) : null}
                </div>

                {total > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex flex-wrap gap-0.5">
                      {sessions.slice(0, 4).map((s) => (
                        <span
                          key={s.id}
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            STATUS_COLORS[s.status] ?? 'bg-primary'
                          )}
                          aria-hidden
                        />
                      ))}
                    </div>
                    <span className="font-body text-[10.5px] font-semibold text-muted-foreground">
                      {total} {total === 1 ? 'sessão' : 'sessões'}
                    </span>
                  </div>
                ) : null}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Agendado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Realizado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            Cancelado
          </span>
          <span className="flex items-center gap-1.5">
            <Home className="h-3 w-3 text-accent" />
            Domiciliar
          </span>
        </div>
      </section>

      <section className="space-y-3">
        <div className="rounded-[20px] border border-border bg-card p-4 shadow-sm sm:p-5">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Dia selecionado
          </p>
          <p className="mt-1 font-display text-[18px] font-bold text-foreground">
            {selectedKey ? formatSelectedLabel(selectedKey) : 'Selecione um dia'}
          </p>
          <p className="mt-1 font-body text-[12.5px] text-muted-foreground">
            {selectedSessions.length === 0
              ? 'Sem atendimentos neste dia.'
              : `${selectedSessions.length} ${selectedSessions.length === 1 ? 'atendimento' : 'atendimentos'}.`}
          </p>
        </div>

        {selectedSessions.length > 0 ? (
          <div className="space-y-3">
            {selectedSessions.map((s) => (
              <SessionCard key={s.id} session={s} allowStatusActions showAddress={domiciliar} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}

function formatSelectedLabel(dayKey: string) {
  const [yearStr, monthStr, dayStr] = dayKey.split('-')
  const date = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr)))
  const label = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}
