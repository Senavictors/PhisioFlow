'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void
  mode?: 'datetime' | 'date'
  className?: string
  placeholder?: string
}

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

function parseValue(value: string, mode: 'datetime' | 'date') {
  if (!value) return null
  const [datePart, timePart] = value.split('T')
  const [year, month, day] = datePart.split('-').map((n) => Number(n))
  if (!year || !month || !day) return null
  let hours = 9
  let minutes = 0
  if (mode === 'datetime' && timePart) {
    const [h, m] = timePart.split(':').map((n) => Number(n))
    hours = Number.isFinite(h) ? h : 9
    minutes = Number.isFinite(m) ? m : 0
  }
  return { year, month, day, hours, minutes }
}

function formatValue(
  parts: { year: number; month: number; day: number; hours: number; minutes: number },
  mode: 'datetime' | 'date'
) {
  const datePart = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
  if (mode === 'date') return datePart
  return `${datePart}T${pad(parts.hours)}:${pad(parts.minutes)}`
}

function formatDisplay(value: string, mode: 'datetime' | 'date') {
  const parts = parseValue(value, mode)
  if (!parts) return ''
  const datePart = `${pad(parts.day)}/${pad(parts.month)}/${parts.year}`
  if (mode === 'date') return datePart
  return `${datePart} • ${pad(parts.hours)}:${pad(parts.minutes)}`
}

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate()

  const cells: Array<{ day: number; month: number; year: number; outside: boolean }> = []

  for (let i = startWeekday - 1; i >= 0; i -= 1) {
    const day = daysInPrevMonth - i
    const prev = new Date(year, month - 2, day)
    cells.push({ day, month: prev.getMonth() + 1, year: prev.getFullYear(), outside: true })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, month, year, outside: false })
  }

  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1]
    const next = new Date(last.year, last.month - 1, last.day + 1)
    cells.push({
      day: next.getDate(),
      month: next.getMonth() + 1,
      year: next.getFullYear(),
      outside: next.getMonth() + 1 !== month || next.getFullYear() !== year,
    })
    if (cells.length >= 42) break
  }

  return cells
}

export function DateTimePicker({
  value,
  onChange,
  mode = 'datetime',
  className,
  placeholder = 'Selecionar...',
}: DateTimePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const today = useMemo(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
  }, [])

  const parsed = useMemo(() => parseValue(value, mode), [value, mode])
  const fallback = parsed ?? { ...today, hours: 9, minutes: 0 }

  const [viewYear, setViewYear] = useState(fallback.year)
  const [viewMonth, setViewMonth] = useState(fallback.month)

  // Sync calendar view to the selected value when the picker opens
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open && parsed) {
      setViewYear(parsed.year)
      setViewMonth(parsed.month)
    }
  }, [open, parsed])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!open) return
    function onDocClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const cells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth])
  const display = formatDisplay(value, mode)

  function commit(parts: {
    year: number
    month: number
    day: number
    hours: number
    minutes: number
  }) {
    onChange(formatValue(parts, mode))
  }

  function selectDay(cell: { day: number; month: number; year: number }) {
    commit({
      year: cell.year,
      month: cell.month,
      day: cell.day,
      hours: fallback.hours,
      minutes: fallback.minutes,
    })
    if (mode === 'date') setOpen(false)
  }

  function shiftMonth(delta: number) {
    let nextMonth = viewMonth + delta
    let nextYear = viewYear
    while (nextMonth < 1) {
      nextMonth += 12
      nextYear -= 1
    }
    while (nextMonth > 12) {
      nextMonth -= 12
      nextYear += 1
    }
    setViewMonth(nextMonth)
    setViewYear(nextYear)
  }

  function setHours(hours: number) {
    commit({ ...fallback, hours, year: parsed?.year ?? fallback.year })
  }
  function setMinutes(minutes: number) {
    commit({ ...fallback, minutes, year: parsed?.year ?? fallback.year })
  }

  function selectToday() {
    commit({ ...today, hours: fallback.hours, minutes: fallback.minutes })
    setViewYear(today.year)
    setViewMonth(today.month)
    if (mode === 'date') setOpen(false)
  }

  function clear() {
    onChange('')
    setOpen(false)
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-input px-3.5 py-2.5',
          'font-body text-[14px] text-foreground',
          'transition-colors duration-[180ms]',
          'hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
        )}
      >
        <span className={cn('truncate', !display && 'text-muted-foreground')}>
          {display || placeholder}
        </span>
        {mode === 'datetime' ? (
          <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {open ? (
        <div
          role="dialog"
          className="absolute left-0 top-[calc(100%+8px)] z-40 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-4 shadow-lg"
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Mês anterior"
              onClick={() => shiftMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="font-display text-[14px] font-bold text-foreground">
              {MONTH_LABELS[viewMonth - 1]} {viewYear}
            </p>
            <button
              type="button"
              aria-label="Próximo mês"
              onClick={() => shiftMonth(1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className="flex h-7 items-center justify-center font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                {label}
              </div>
            ))}
            {cells.map((cell, index) => {
              const isSelected =
                parsed &&
                parsed.day === cell.day &&
                parsed.month === cell.month &&
                parsed.year === cell.year
              const isToday =
                today.day === cell.day &&
                today.month === cell.month &&
                today.year === cell.year
              return (
                <button
                  key={`${cell.year}-${cell.month}-${cell.day}-${index}`}
                  type="button"
                  onClick={() => selectDay(cell)}
                  className={cn(
                    'flex h-9 items-center justify-center rounded-lg font-body text-[13px] transition-colors',
                    cell.outside ? 'text-muted-foreground/50' : 'text-foreground',
                    !isSelected && 'hover:bg-muted',
                    isSelected && 'bg-primary text-primary-foreground shadow-glow',
                    !isSelected && isToday && 'border border-primary/40'
                  )}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>

          {mode === 'datetime' ? (
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
              <Clock3 className="h-4 w-4 text-muted-foreground" />
              <select
                value={fallback.hours}
                onChange={(event) => setHours(Number(event.target.value))}
                className="rounded-lg border border-border bg-input px-2 py-1.5 font-body text-[13px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {pad(h)}
                  </option>
                ))}
              </select>
              <span className="font-body text-[13px] text-muted-foreground">:</span>
              <select
                value={fallback.minutes - (fallback.minutes % 5)}
                onChange={(event) => setMinutes(Number(event.target.value))}
                className="rounded-lg border border-border bg-input px-2 py-1.5 font-body text-[13px] text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {pad(m)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto rounded-lg bg-primary px-3 py-1.5 font-body text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Pronto
              </button>
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={clear}
              className="font-body text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={selectToday}
              className="font-body text-[12px] font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              Hoje
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
