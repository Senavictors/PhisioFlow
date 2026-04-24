'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const AREAS = [
  { value: '', label: 'Todas as Áreas' },
  { value: 'PILATES', label: 'Pilates' },
  { value: 'MOTOR', label: 'Motora' },
  { value: 'AESTHETIC', label: 'Estética' },
  { value: 'HOME_CARE', label: 'Domiciliar' },
]

const CLASSIFICATIONS = [
  { value: '', label: 'Todas' },
  { value: 'ELDERLY', label: 'Idoso' },
  { value: 'PCD', label: 'PCD' },
  { value: 'POST_ACCIDENT', label: 'Pós-acidente' },
  { value: 'STANDARD', label: 'Padrão' },
]

export function PatientFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const area = searchParams.get('area') ?? ''
  const classification = searchParams.get('classification') ?? ''
  const search = searchParams.get('search') ?? ''

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  const hasFilters = area || classification || search

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar paciente..."
          defaultValue={search}
          onChange={(e) => updateParam('search', e.target.value)}
          className={cn(
            'w-full pl-9 pr-4 py-2.5 rounded-xl bg-input border border-border',
            'font-body text-[13px] text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary',
            'transition-colors duration-[180ms]'
          )}
        />
      </div>

      <select
        value={area}
        onChange={(e) => updateParam('area', e.target.value)}
        className={cn(
          'px-3 py-2.5 rounded-xl bg-input border border-border',
          'font-body text-[13px] text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary',
          'transition-colors duration-[180ms]'
        )}
      >
        {AREAS.map((a) => (
          <option key={a.value} value={a.value}>
            {a.label}
          </option>
        ))}
      </select>

      <select
        value={classification}
        onChange={(e) => updateParam('classification', e.target.value)}
        className={cn(
          'px-3 py-2.5 rounded-xl bg-input border border-border',
          'font-body text-[13px] text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary',
          'transition-colors duration-[180ms]'
        )}
      >
        {CLASSIFICATIONS.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted font-body text-[13px] transition-colors duration-[180ms]"
        >
          <X className="w-3.5 h-3.5" />
          Limpar
        </button>
      )}
    </div>
  )
}
