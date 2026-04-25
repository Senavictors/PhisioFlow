'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { ThemedSelect } from '@/components/ui/themed-select'

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
      <ThemedSelect
        value={currentType}
        onChange={(next) => updateFilter('type', next)}
        options={TYPE_OPTIONS}
        ariaLabel="Filtrar por tipo de documento"
        className="sm:w-[260px]"
      />
    </div>
  )
}
