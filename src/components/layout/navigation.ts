import type { LucideIcon } from 'lucide-react'
import {
  Calendar,
  CircleDollarSign,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  Settings,
  Users,
} from 'lucide-react'

export interface NavigationItem {
  label: string
  href: string
  icon: LucideIcon
}

export const primaryNavigation: NavigationItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Pacientes', href: '/pacientes', icon: Users },
  { label: 'Atendimentos', href: '/atendimentos', icon: ClipboardList },
  { label: 'Agenda', href: '/agenda', icon: Calendar },
  { label: 'Documentos', href: '/documentos', icon: FileText },
  { label: 'Financeiro', href: '/financeiro', icon: CircleDollarSign },
]

export const secondaryNavigation: NavigationItem[] = [
  { label: 'Locais', href: '/configuracoes/locais', icon: MapPin },
  { label: 'Configurações', href: '/configuracoes/email', icon: Settings },
  { label: 'Suporte', href: '/suporte', icon: HelpCircle },
]

export const pageTitles: Record<string, string> = {
  '/dashboard': 'Visão Geral',
  '/pacientes': 'Pacientes',
  '/atendimentos': 'Atendimentos',
  '/agenda': 'Agenda',
  '/documentos': 'Documentos',
  '/financeiro': 'Financeiro',
  '/configuracoes': 'Configurações',
}

export function isPathActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
