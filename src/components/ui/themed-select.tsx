'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemedSelectOption {
  value: string
  label: string
}

interface ThemedSelectProps {
  value: string
  onChange: (value: string) => void
  options: ThemedSelectOption[]
  ariaLabel: string
  className?: string
}

export function ThemedSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: ThemedSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const selected = options.find((option) => option.value === value) ?? options[0]

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-input px-3 py-2.5',
          'font-body text-[13px] text-foreground',
          'transition-colors duration-[180ms]',
          'hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-[180ms]',
            open && 'rotate-180'
          )}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-lg"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <li key={option.value || '__all'}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left',
                    'font-body text-[13px] transition-colors duration-[180ms]',
                    isSelected
                      ? 'bg-primary-soft text-primary'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
