'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Visão Geral',
  '/pacientes': 'Pacientes',
  '/atendimentos': 'Atendimentos',
  '/agenda': 'Agenda',
  '/documentos': 'Documentos',
}

export function Topbar() {
  const pathname = usePathname()
  const title = Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ?? ''

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-10 py-[18px] border-b border-border bg-background">
      <p className="font-display font-bold text-[17px] text-foreground">{title}</p>

      <div className="flex items-center gap-3.5">
        {/* Search */}
        <div className={cn(
          'flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2',
          'font-body text-[13px] text-muted-foreground w-[260px]'
        )}>
          <Search className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Buscar...</span>
        </div>

        {/* Icon buttons */}
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-[180ms]">
          <Bell className="w-4 h-4" strokeWidth={1.75} />
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-[180ms]">
          <HelpCircle className="w-4 h-4" strokeWidth={1.75} />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-primary border-2 border-card flex items-center justify-center font-body font-bold text-[14px] text-primary-foreground select-none">
          A
        </div>
      </div>
    </header>
  )
}
