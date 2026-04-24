'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DomiciliarToggleProps {
  active: boolean
}

export function DomiciliarToggle({ active }: DomiciliarToggleProps) {
  const router = useRouter()
  const pathname = usePathname()

  function toggle() {
    router.push(active ? pathname : `${pathname}?domiciliar=1`)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'flex items-center gap-2 rounded-xl px-4 py-2.5 font-body text-[13px] font-semibold transition-colors duration-[180ms]',
        active
          ? 'bg-warning-soft text-warning'
          : 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Home className="h-4 w-4" />
      Domiciliar
    </button>
  )
}
