'use client'

import { useTransition } from 'react'
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
  const [isPending, startTransition] = useTransition()

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
    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
    })
  }

  const hasFilters = area || classification || search

  return (
    <div className="rounded-[18px] border border-border bg-card/80 p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative w-full xl:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            defaultValue={search}
            onChange={(e) => updateParam('search', e.target.value)}
            className={cn(
              'w-full rounded-xl border border-border bg-input py-2.5 pl-9 pr-4',
              'font-body text-[13px] text-foreground placeholder:text-muted-foreground',
              'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
              'transition-colors duration-[180ms]'
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:w-auto">
          <select
            value={area}
            onChange={(e) => updateParam('area', e.target.value)}
            className={cn(
              'w-full rounded-xl border border-border bg-input px-3 py-2.5',
              'font-body text-[13px] text-foreground',
              'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
              'transition-colors duration-[180ms] xl:min-w-[170px]'
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
              'w-full rounded-xl border border-border bg-input px-3 py-2.5',
              'font-body text-[13px] text-foreground',
              'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
              'transition-colors duration-[180ms] xl:min-w-[160px]'
            )}
          >
            {CLASSIFICATIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={() =>
              startTransition(() => {
                router.push(pathname)
              })
            }
            className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 font-body text-[13px] text-muted-foreground transition-colors duration-[180ms] hover:bg-muted hover:text-foreground sm:w-auto xl:ml-auto"
          >
            <X className="h-3.5 w-3.5" />
            Limpar
          </button>
        )}
      </div>

      {isPending ? (
        <p className="mt-3 px-1 font-body text-[12px] text-muted-foreground">
          Atualizando lista...
        </p>
      ) : null}
    </div>
  )
}
