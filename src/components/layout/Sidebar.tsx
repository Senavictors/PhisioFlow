'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Pacientes', href: '/pacientes', icon: Users },
  { label: 'Atendimentos', href: '/atendimentos', icon: ClipboardList },
  { label: 'Agenda', href: '/agenda', icon: Calendar },
  { label: 'Documentos', href: '/documentos', icon: FileText },
]

const footerItems = [
  { label: 'Configurações', href: '/configuracoes', icon: Settings },
  { label: 'Suporte', href: '/suporte', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 h-screen w-[220px] shrink-0 border-r border-border bg-background flex flex-col gap-0.5 px-4 pt-[22px] pb-5">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 pb-[26px]">
        <div className="w-[38px] h-[38px] rounded-[11px] bg-primary flex items-center justify-center shrink-0">
          <Activity className="w-[22px] h-[22px] text-primary-foreground" strokeWidth={1.75} />
        </div>
        <div>
          <p className="font-display font-bold text-[18px] text-foreground leading-none tracking-tight">
            PhisioFlow
          </p>
          <p className="font-body text-[8.5px] font-bold uppercase tracking-[0.22em] text-muted-foreground mt-1 leading-tight">
            Portal Restaurativo
          </p>
        </div>
      </div>

      {/* Nav principal */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-[14px] py-[11px] rounded-xl',
                'font-body text-[10.5px] font-bold uppercase tracking-[0.16em]',
                'transition-all duration-[180ms]',
                active
                  ? 'bg-primary text-white shadow-glow'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon
                className={cn('w-[18px] h-[18px] shrink-0', active ? 'text-white' : 'text-muted-foreground')}
                strokeWidth={1.75}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="flex flex-col gap-0.5 pt-3 mt-3 border-t border-border">
        {footerItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-[14px] py-[11px] rounded-xl',
              'font-body text-[10.5px] font-bold uppercase tracking-[0.16em]',
              'text-muted-foreground hover:bg-muted hover:text-foreground',
              'transition-all duration-[180ms]'
            )}
          >
            <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
            {label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
