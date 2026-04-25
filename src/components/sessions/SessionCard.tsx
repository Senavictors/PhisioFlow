'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import {
  CalendarDays,
  CalendarX2,
  Check,
  Clock3,
  Home,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  UserRound,
  X,
} from 'lucide-react'
import type { SessionStatus, SessionType } from '@/generated/prisma/client'
import { formatDateLongPtBr, formatTimePtBr } from '@/lib/date'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/sessions/StatusBadge'
import { SESSION_TYPE_LABELS } from '@/components/sessions/session-meta'
import { CalendarSyncBadge } from '@/components/calendar/CalendarSyncBadge'

interface SessionCardProps {
  session: {
    id: string
    date: Date | string
    duration: number
    type: SessionType
    status: SessionStatus
    subjective?: string | null
    objective?: string | null
    assessment?: string | null
    plan?: string | null
    workplace?: { id: string; name: string } | null
    calendarEventLinks?: Array<{
      id: string
      status: string
      calendarId: string
      externalEventId: string
      errorMessage?: string | null
      lastSyncedAt?: Date | string | null
    }>
    patient: {
      id: string
      name: string
      area?: string
      homeCarePriority?: string | null
      address?: string | null
      neighborhood?: string | null
      city?: string | null
      email?: string | null
    }
  }
  showDate?: boolean
  allowStatusActions?: boolean
  showAddress?: boolean
}

function getSessionSummary(session: SessionCardProps['session']) {
  return [session.subjective, session.objective, session.assessment, session.plan].find(
    (value) => typeof value === 'string' && value.trim().length > 0
  )
}

interface EmailSettingsSummary {
  isEnabled: boolean
  hasAppPassword: boolean
}

let cachedEmailSettings: EmailSettingsSummary | null = null
let inflightEmailSettings: Promise<EmailSettingsSummary | null> | null = null

async function loadEmailSettings(): Promise<EmailSettingsSummary | null> {
  if (cachedEmailSettings) return cachedEmailSettings
  if (!inflightEmailSettings) {
    inflightEmailSettings = fetch('/api/settings/email')
      .then((r) => r.json())
      .then((data) => {
        cachedEmailSettings = data.settings ?? null
        return cachedEmailSettings
      })
      .catch(() => null)
      .finally(() => {
        inflightEmailSettings = null
      })
  }
  return inflightEmailSettings
}

export function SessionCard({
  session,
  showDate = false,
  allowStatusActions = true,
  showAddress = false,
}: SessionCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [menuOpen, setMenuOpen] = useState(false)
  const [busyAction, setBusyAction] = useState<null | 'email' | 'sync' | 'sync-remove'>(null)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null
  )
  const [emailSettings, setEmailSettings] = useState<EmailSettingsSummary | null>(
    cachedEmailSettings
  )
  const menuRef = useRef<HTMLDivElement>(null)

  const summary = getSessionSummary(session)
  const calendarLink = session.calendarEventLinks?.[0]
  const isScheduled = session.status === 'AGENDADO'
  const isSynced = calendarLink?.status === 'SYNCED'

  useEffect(() => {
    if (allowStatusActions && isScheduled && !emailSettings) {
      void loadEmailSettings().then(setEmailSettings)
    }
  }, [allowStatusActions, isScheduled, emailSettings])

  useEffect(() => {
    if (!menuOpen) return
    function onDocClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    function onEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [menuOpen])

  async function updateStatus(nextStatus: Extract<SessionStatus, 'REALIZADO' | 'CANCELADO'>) {
    const response = await fetch(`/api/sessions/${session.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    if (response.ok) router.refresh()
  }

  function handleStatusUpdate(nextStatus: Extract<SessionStatus, 'REALIZADO' | 'CANCELADO'>) {
    setMenuOpen(false)
    startTransition(() => {
      void updateStatus(nextStatus)
    })
  }

  async function handleSendReminder() {
    setMenuOpen(false)
    setFeedback(null)
    setBusyAction('email')
    try {
      const response = await fetch(`/api/sessions/${session.id}/email-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setFeedback({ kind: 'error', message: data.message ?? 'Falha ao enviar' })
        return
      }
      setFeedback({ kind: 'success', message: 'Aviso enviado!' })
    } finally {
      setBusyAction(null)
    }
  }

  async function handleCalendarSync() {
    setMenuOpen(false)
    setFeedback(null)
    setBusyAction('sync')
    try {
      const response = await fetch(`/api/sessions/${session.id}/calendar-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setFeedback({ kind: 'error', message: data.message ?? 'Erro ao sincronizar' })
        return
      }
      router.refresh()
    } finally {
      setBusyAction(null)
    }
  }

  async function handleCalendarRemove() {
    setMenuOpen(false)
    setFeedback(null)
    setBusyAction('sync-remove')
    try {
      const response = await fetch(`/api/sessions/${session.id}/calendar-sync`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setFeedback({ kind: 'error', message: data.message ?? 'Erro ao remover evento' })
        return
      }
      router.refresh()
    } finally {
      setBusyAction(null)
    }
  }

  const emailReady = Boolean(emailSettings?.isEnabled && emailSettings?.hasAppPassword)
  const emailDisabledReason = !emailReady
    ? 'Configure o e-mail em Configurações primeiro.'
    : !session.patient.email
      ? 'Paciente não tem e-mail cadastrado.'
      : null

  return (
    <article className="rounded-[20px] border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-[112px] shrink-0 flex-col rounded-[18px] bg-primary-soft/80 px-4 py-3 text-left">
            <Clock3 className="h-3.5 w-3.5 text-primary-soft-fg" />
            <span className="mt-2 font-display text-[28px] font-bold leading-none text-primary sm:text-[30px]">
              {formatTimePtBr(session.date)}
            </span>
            <span className="mt-2 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-soft-fg">
              {session.duration} min
            </span>
            {showDate ? (
              <span className="mt-2 font-body text-[12px] text-primary-soft-fg">
                {formatDateLongPtBr(session.date)}
              </span>
            ) : null}
          </div>

          <div className="min-w-0 space-y-3">
            <Link
              href={`/pacientes/${session.patient.id}`}
              className="block font-display text-[24px] font-bold leading-tight text-foreground transition-colors hover:text-primary"
            >
              {session.patient.name}
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              {session.type === 'HOME_CARE' ? (
                <span className="rounded-full bg-accent-soft px-2.5 py-1 font-body text-[11px] font-semibold text-accent-soft-fg">
                  Domiciliar
                </span>
              ) : null}
              {session.type === 'HOME_CARE' && session.patient.homeCarePriority === 'URGENT' ? (
                <span className="rounded-full bg-[var(--color-accent)] px-2.5 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-white">
                  Urgente
                </span>
              ) : session.type === 'HOME_CARE' && session.patient.homeCarePriority === 'HIGH' ? (
                <span className="rounded-full bg-warning-soft px-2.5 py-1 font-body text-[11px] font-semibold text-warning">
                  Prioritário
                </span>
              ) : null}
              <StatusBadge status={session.status} />
              <CalendarSyncBadge status={calendarLink?.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-body text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                {session.type === 'HOME_CARE' ? (
                  <Home className="h-3.5 w-3.5" />
                ) : (
                  <UserRound className="h-3.5 w-3.5" />
                )}
                {session.type === 'HOME_CARE' ? 'Atendimento domiciliar' : SESSION_TYPE_LABELS[session.type]}
              </span>
              {!showDate ? (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDateLongPtBr(session.date)}
                </span>
              ) : null}
              {session.workplace ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {session.workplace.name}
                </span>
              ) : null}
              {showAddress && session.patient.address ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {[session.patient.address, session.patient.neighborhood, session.patient.city]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              ) : null}
            </div>

            {summary ? (
              <p className="max-w-[720px] font-body text-[13px] leading-relaxed text-muted-foreground">
                {summary}
              </p>
            ) : (
              <p className="font-body text-[13px] leading-relaxed text-muted-foreground">
                SOAP ainda sem conteúdo detalhado para esta sessão.
              </p>
            )}

            {feedback ? (
              <p
                className={cn(
                  'font-body text-[12px]',
                  feedback.kind === 'success' ? 'text-primary' : 'text-danger'
                )}
              >
                {feedback.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start">
          {allowStatusActions && isScheduled ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleStatusUpdate('REALIZADO')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5',
                'font-body text-[13px] font-semibold text-primary-foreground shadow-glow',
                'transition-colors duration-[180ms] hover:bg-primary-hover disabled:opacity-60'
              )}
            >
              <Check className="h-4 w-4" />
              Confirmar
            </button>
          ) : null}

          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="Mais ações"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors duration-[180ms] hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
            >
              {busyAction ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-lg"
              >
                {allowStatusActions && isScheduled ? (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={isPending}
                    onClick={() => handleStatusUpdate('CANCELADO')}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-body text-[13px] font-semibold text-danger transition-colors hover:bg-danger-soft disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                ) : null}

                {allowStatusActions && isScheduled ? (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={Boolean(emailDisabledReason) || busyAction === 'email'}
                    title={emailDisabledReason ?? undefined}
                    onClick={handleSendReminder}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-body text-[13px] font-medium text-foreground transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Mail className="h-4 w-4" />
                    Enviar aviso
                  </button>
                ) : null}

                {isScheduled ? (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={busyAction === 'sync'}
                    onClick={handleCalendarSync}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-body text-[13px] font-medium text-foreground transition-colors hover:bg-primary-soft disabled:opacity-60"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {calendarLink?.status === 'FAILED'
                      ? 'Tentar sincronizar'
                      : isSynced
                        ? 'Atualizar agenda'
                        : 'Sincronizar agenda'}
                  </button>
                ) : null}

                {isScheduled && isSynced ? (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={busyAction === 'sync-remove'}
                    onClick={handleCalendarRemove}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-body text-[13px] font-medium text-foreground transition-colors hover:bg-primary-soft disabled:opacity-60"
                  >
                    <CalendarX2 className="h-4 w-4" />
                    Remover do Google
                  </button>
                ) : null}

                <Link
                  role="menuitem"
                  href={`/atendimentos/${session.id}/editar`}
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-body text-[13px] font-medium text-foreground transition-colors hover:bg-primary-soft"
                >
                  <Pencil className="h-4 w-4" />
                  Editar SOAP
                </Link>

                <Link
                  role="menuitem"
                  href={`/pacientes/${session.patient.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-body text-[13px] font-medium text-foreground transition-colors hover:bg-primary-soft"
                >
                  <UserRound className="h-4 w-4" />
                  Abrir paciente
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
