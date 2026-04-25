'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Home, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DomiciliarToggleProps {
  active: boolean
}

export function DomiciliarToggle({ active }: DomiciliarToggleProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const params = new URLSearchParams(searchParams.toString())
    if (active) {
      params.delete('domiciliar')
    } else {
      params.set('domiciliar', '1')
    }
    const query = params.toString()
    const next = query ? `${pathname}?${query}` : pathname
    startTransition(() => {
      router.push(next)
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      disabled={isPending}
      className={cn(
        'flex items-center gap-2 rounded-xl px-4 py-2.5 font-body text-[13px] font-semibold transition-colors duration-[180ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70',
        active
          ? 'bg-warning-soft text-warning hover:bg-warning-soft/80 focus-visible:ring-warning'
          : 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Home className="h-4 w-4" />
      )}
      Domiciliar
    </button>
  )
}
