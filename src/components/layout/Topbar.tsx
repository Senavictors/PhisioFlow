'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Search, Bell, HelpCircle, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Visão Geral',
  '/pacientes': 'Pacientes',
  '/atendimentos': 'Atendimentos',
  '/agenda': 'Agenda',
  '/documentos': 'Documentos',
}

interface TopbarProps {
  userName: string
}

export function Topbar({ userName }: TopbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const title = Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ?? ''
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-10 py-[18px] border-b border-border bg-background">
      <p className="font-display font-bold text-[17px] text-foreground">{title}</p>

      <div className="flex items-center gap-3.5">
        {/* Search */}
        <div
          className={cn(
            'flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2',
            'font-body text-[13px] text-muted-foreground w-[260px]'
          )}
        >
          <Search className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Buscar...</span>
        </div>

        <button className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-[180ms]">
          <Bell className="w-4 h-4" strokeWidth={1.75} />
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-[180ms]">
          <HelpCircle className="w-4 h-4" strokeWidth={1.75} />
        </button>

        {/* Avatar com tooltip de logout */}
        <div className="relative group">
          <div className="w-9 h-9 rounded-full bg-primary border-2 border-card flex items-center justify-center font-body font-bold text-[14px] text-primary-foreground select-none cursor-pointer">
            {initials}
          </div>
          <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col bg-card border border-border rounded-xl shadow-md overflow-hidden min-w-[160px] z-20">
            <div className="px-4 py-3 border-b border-border">
              <p className="font-body text-[13px] font-semibold text-foreground truncate">{userName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 font-body text-[13px] text-danger hover:bg-danger-soft transition-colors duration-[150ms]"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
