'use client'

import { useEffect, useRef, useState } from 'react'
import { Info } from 'lucide-react'

export function PeriodInfoTooltip() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-label="O que é o período?"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary focus:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Info className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
      {open ? (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-[240px] -translate-x-1/2 rounded-xl border border-border bg-card px-3 py-2 font-body text-[12px] leading-relaxed text-foreground shadow-md"
        >
          O período limita quais atendimentos entram no relatório/declaração. Ex.: 01/2026 –
          04/2026.
        </span>
      ) : null}
    </span>
  )
}
