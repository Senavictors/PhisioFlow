'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, HelpCircle, LogOut, Menu, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { pageTitles } from '@/components/layout/navigation'

interface TopbarProps {
  userName: string
  onOpenNavigation: () => void
}

const iconButtonClass =
  'flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors duration-[180ms] hover:bg-muted hover:text-foreground'

export function Topbar({ userName, onOpenNavigation }: TopbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const title =
    Object.entries(pageTitles)
      .sort(([left], [right]) => right.length - left.length)
      .find(([key]) => pathname.startsWith(key))?.[1] ?? ''
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
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8 xl:px-10">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenNavigation}
            className={cn(iconButtonClass, 'lg:hidden')}
            aria-label="Abrir navegação"
          >
            <Menu className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <div className="min-w-0">
            <p className="hidden font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:block">
              Portal Restaurativo
            </p>
            <p className="truncate font-display text-[18px] font-bold text-foreground sm:text-[20px]">
              {title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div
            className={cn(
              'hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 md:flex',
              'w-[220px] font-body text-[13px] text-muted-foreground lg:w-[300px] xl:w-[360px]'
            )}
          >
            <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>Buscar...</span>
          </div>

          <button type="button" className={cn(iconButtonClass, 'md:hidden')} aria-label="Buscar">
            <Search className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <button type="button" className={iconButtonClass} aria-label="Notificações">
            <Bell className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button type="button" className={iconButtonClass} aria-label="Ajuda">
            <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-card bg-primary font-body text-[14px] font-bold text-primary-foreground transition-transform duration-[180ms] hover:scale-[1.02]"
              aria-label="Abrir menu do usuário"
            >
              {initials}
            </button>

            <div
              className={cn(
                'absolute right-0 top-full z-20 mt-2 min-w-[188px] overflow-hidden rounded-xl border border-border bg-card shadow-md transition-all duration-[180ms]',
                menuOpen
                  ? 'translate-y-0 opacity-100'
                  : 'pointer-events-none -translate-y-1 opacity-0'
              )}
            >
              <div className="border-b border-border px-4 py-3">
                <p className="truncate font-body text-[13px] font-semibold text-foreground">
                  {userName}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-left font-body text-[13px] text-danger transition-colors duration-[150ms] hover:bg-danger-soft"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
