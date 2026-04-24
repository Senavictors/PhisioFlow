'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SoapAccordionProps {
  subjective?: string | null
  objective?: string | null
  assessment?: string | null
  plan?: string | null
  defaultOpen?: boolean
}

const SOAP_FIELDS = [
  { key: 'subjective', label: 'S — Subjetivo', placeholder: 'Nenhuma queixa registrada.' },
  { key: 'objective', label: 'O — Objetivo', placeholder: 'Nenhum achado clínico registrado.' },
  { key: 'assessment', label: 'A — Avaliação', placeholder: 'Nenhuma avaliação registrada.' },
  { key: 'plan', label: 'P — Plano', placeholder: 'Nenhum plano registrado.' },
] as const

export function SoapAccordion({
  subjective,
  objective,
  assessment,
  plan,
  defaultOpen = false,
}: SoapAccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  const values = { subjective, objective, assessment, plan }
  const hasContent = Object.values(values).some(v => v && v.trim().length > 0)

  return (
    <div className="mt-4 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Notas SOAP {!hasContent && <span className="ml-1 normal-case italic">— sem conteúdo</span>}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-[180ms]',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SOAP_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <p className="font-body text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {label}
              </p>
              <p
                className={cn(
                  'mt-1 font-body text-[13px] leading-relaxed',
                  values[key] ? 'text-foreground' : 'italic text-muted-foreground'
                )}
              >
                {values[key] || placeholder}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
