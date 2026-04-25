'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Activity, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  isPathActive,
  primaryNavigation,
  secondaryNavigation,
} from '@/components/layout/navigation'

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-2 pb-7">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-primary">
          <Activity className="h-[22px] w-[22px] text-primary-foreground" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-[18px] font-bold leading-none tracking-tight text-foreground">
            PhysioFlow
          </p>
          <p className="mt-1 font-body text-[8.5px] font-bold uppercase leading-tight tracking-[0.22em] text-muted-foreground">
            Experiência Clínica Fluida
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {primaryNavigation.map(({ label, href, icon: Icon }) => {
          const active = isPathActive(pathname, href)

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-xl px-[14px] py-[11px]',
                'font-body text-[10.5px] font-bold uppercase tracking-[0.16em]',
                'transition-all duration-[180ms]',
                active
                  ? 'bg-primary text-white shadow-glow'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-[18px] w-[18px] shrink-0',
                  active ? 'text-white' : 'text-muted-foreground'
                )}
                strokeWidth={1.75}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      <div className="mt-3 flex flex-col gap-0.5 border-t border-border pt-3">
        {secondaryNavigation.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-xl px-[14px] py-[11px]',
              'font-body text-[10.5px] font-bold uppercase tracking-[0.16em]',
              'text-muted-foreground transition-all duration-[180ms]',
              'hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
            {label}
          </Link>
        ))}
      </div>
    </>
  )
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  const previousPathname = useRef(pathname)
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname
      if (mobileOpen) onClose?.()
    }
  }, [pathname, mobileOpen, onClose])

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 border-r border-border bg-background px-4 pb-5 pt-[22px] lg:flex lg:flex-col lg:gap-0.5 xl:w-[248px]">
        <SidebarContent pathname={pathname} />
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-foreground/15 backdrop-blur-[1px] transition-opacity duration-[180ms] lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[86vw] flex-col border-r border-border bg-background px-4 pb-5 pt-[18px] shadow-lg transition-transform duration-[220ms] ease-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-[18px] font-bold leading-none tracking-tight text-foreground">
              PhysioFlow
            </p>
            <p className="mt-1 font-body text-[8.5px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Experiência Clínica Fluida
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors duration-[180ms] hover:bg-muted hover:text-foreground"
            aria-label="Fechar navegação"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <SidebarContent pathname={pathname} onNavigate={onClose} />
      </aside>
    </>
  )
}
