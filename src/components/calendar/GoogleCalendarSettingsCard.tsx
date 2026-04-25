'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck2, ExternalLink, Loader2, RefreshCw, Unplug } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarConnectionSafe {
  connected: boolean
  accountEmail?: string
  calendarId?: string
  calendarSummary?: string
  syncNewSessionsByDefault: boolean
}

interface GoogleCalendarSummary {
  id: string
  summary: string
  primary: boolean
}

interface GoogleCalendarSettingsCardProps {
  initialConnection: CalendarConnectionSafe
  status?: string
}

const inputClass = cn(
  'w-full rounded-xl border border-border bg-input px-3.5 py-2.5',
  'font-body text-[14px] text-foreground',
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
  'transition-colors duration-[180ms]'
)

export function GoogleCalendarSettingsCard({
  initialConnection,
  status,
}: GoogleCalendarSettingsCardProps) {
  const [connection, setConnection] = useState(initialConnection)
  const [calendars, setCalendars] = useState<GoogleCalendarSummary[]>([])
  const [calendarId, setCalendarId] = useState(initialConnection.calendarId ?? '')
  const [syncDefault, setSyncDefault] = useState(initialConnection.syncNewSessionsByDefault)
  const [loadingCalendars, setLoadingCalendars] = useState(initialConnection.connected)
  const [saving, setSaving] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const selectedCalendar = useMemo(
    () => calendars.find((calendar) => calendar.id === calendarId),
    [calendarId, calendars]
  )

  async function loadCalendars() {
    if (!connection.connected) return
    setError('')
    setLoadingCalendars(true)

    const response = await fetch('/api/integrations/google-calendar/calendars')
    const data = await response.json().catch(() => ({}))
    setLoadingCalendars(false)

    if (!response.ok) {
      setError(data.message ?? 'Erro ao carregar agendas')
      return
    }

    const nextCalendars = data.calendars ?? []
    setCalendars(nextCalendars)

    if (!calendarId && nextCalendars.length > 0) {
      const primary = nextCalendars.find((calendar: GoogleCalendarSummary) => calendar.primary)
      setCalendarId((primary ?? nextCalendars[0]).id)
    }
  }

  async function saveSettings() {
    setMessage('')
    setError('')

    if (!calendarId) {
      setError('Selecione uma agenda')
      return
    }

    setSaving(true)
    const response = await fetch('/api/integrations/google-calendar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calendarId,
        calendarSummary: selectedCalendar?.summary ?? connection.calendarSummary,
        syncNewSessionsByDefault: syncDefault,
      }),
    })
    const data = await response.json().catch(() => ({}))
    setSaving(false)

    if (!response.ok) {
      setError(data.message ?? 'Erro ao salvar integração')
      return
    }

    setConnection(data.connection)
    setMessage('Integração salva.')
  }

  async function disconnect() {
    setMessage('')
    setError('')
    setDisconnecting(true)
    const response = await fetch('/api/integrations/google-calendar', { method: 'DELETE' })
    const data = await response.json().catch(() => ({}))
    setDisconnecting(false)

    if (!response.ok) {
      setError(data.message ?? 'Erro ao desconectar')
      return
    }

    setConnection({ connected: false, syncNewSessionsByDefault: false })
    setCalendars([])
    setCalendarId('')
    setSyncDefault(false)
    setMessage('Google Calendar desconectado.')
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialCalendars() {
      if (!connection.connected) return

      const response = await fetch('/api/integrations/google-calendar/calendars')
      const data = await response.json().catch(() => ({}))

      if (ignore) return

      setLoadingCalendars(false)

      if (!response.ok) {
        setError(data.message ?? 'Erro ao carregar agendas')
        return
      }

      const nextCalendars = data.calendars ?? []
      setCalendars(nextCalendars)

      if (!calendarId && nextCalendars.length > 0) {
        const primary = nextCalendars.find((calendar: GoogleCalendarSummary) => calendar.primary)
        setCalendarId((primary ?? nextCalendars[0]).id)
      }
    }

    void loadInitialCalendars()

    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection.connected])

  return (
    <section className="rounded-[22px] border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <CalendarCheck2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-[20px] font-bold text-foreground">Google Calendar</p>
            <p className="mt-1 font-body text-[13px] text-muted-foreground">
              Sincronize atendimentos do PhysioFlow em uma agenda Google.
            </p>
          </div>
        </div>

        <span
          className={cn(
            'w-fit rounded-full px-3 py-1 font-body text-[11px] font-semibold',
            connection.connected ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground'
          )}
        >
          {connection.connected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      {status === 'connected' ? (
        <p className="mt-5 rounded-xl bg-success-soft px-3 py-2 font-body text-[12px] text-success">
          Conta Google conectada. Selecione a agenda padrão para concluir.
        </p>
      ) : status === 'error' ? (
        <p className="mt-5 rounded-xl bg-danger-soft px-3 py-2 font-body text-[12px] text-danger">
          Não foi possível conectar a conta Google. Tente novamente.
        </p>
      ) : null}

      {message ? (
        <p className="mt-5 rounded-xl bg-success-soft px-3 py-2 font-body text-[12px] text-success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-5 rounded-xl bg-danger-soft px-3 py-2 font-body text-[12px] text-danger">
          {error}
        </p>
      ) : null}

      {!connection.connected ? (
        <div className="mt-6">
          <Link
            href="/api/integrations/google-calendar/connect"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover sm:w-auto"
          >
            <ExternalLink className="h-4 w-4" />
            Conectar Google Calendar
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="rounded-[18px] border border-border bg-background/70 p-4">
            <p className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Conta conectada
            </p>
            <p className="mt-2 font-body text-[14px] font-semibold text-foreground">
              {connection.accountEmail}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-1.5">
              <label className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Agenda padrão
              </label>
              <select
                className={inputClass}
                value={calendarId}
                onChange={(event) => setCalendarId(event.target.value)}
                disabled={loadingCalendars}
              >
                <option value="">
                  {loadingCalendars ? 'Carregando agendas...' : 'Selecione uma agenda'}
                </option>
                {calendars.map((calendar) => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.summary}
                    {calendar.primary ? ' (principal)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => void loadCalendars()}
              disabled={loadingCalendars}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 font-body text-[13px] font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              {loadingCalendars ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Atualizar
            </button>
          </div>

          <label className="flex items-start gap-3 rounded-[18px] border border-border bg-background/70 p-4">
            <input
              type="checkbox"
              checked={syncDefault}
              onChange={(event) => setSyncDefault(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
            />
            <span>
              <span className="block font-body text-[13px] font-semibold text-foreground">
                Sincronizar novos atendimentos automaticamente
              </span>
              <span className="mt-1 block font-body text-[12px] text-muted-foreground">
                O formulário de atendimento ainda permite alterar essa escolha por sessão.
              </span>
            </span>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => void disconnect()}
              disabled={disconnecting || saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-body text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-60"
            >
              {disconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Unplug className="h-4 w-4" />
              )}
              Desconectar
            </button>

            <button
              type="button"
              onClick={() => void saveSettings()}
              disabled={saving || loadingCalendars}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? 'Salvando...' : 'Salvar integração'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
