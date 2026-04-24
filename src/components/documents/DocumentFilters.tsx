'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const TYPE_OPTIONS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'LAUDO_FISIOTERAPEUTICO', label: 'Laudo Fisioterapêutico' },
  { value: 'RELATORIO_PROGRESSO', label: 'Relatório de Progresso' },
  { value: 'DECLARACAO_COMPARECIMENTO', label: 'Declaração de Comparecimento' },
]

export function DocumentFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentType = searchParams.get('type') ?? ''

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={currentType}
        onChange={(e) => updateFilter('type', e.target.value)}
        className="h-9 rounded-xl border border-border bg-card px-3 font-body text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
