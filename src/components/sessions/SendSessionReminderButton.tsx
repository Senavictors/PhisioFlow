'use client'

import { useEffect, useState } from 'react'
import { Loader2, Mail } from 'lucide-react'

interface SendSessionReminderButtonProps {
  sessionId: string
  patientHasEmail: boolean
}

interface EmailSettingsSummary {
  isEnabled: boolean
  hasAppPassword: boolean
}

let cachedSettings: EmailSettingsSummary | null = null
let inflight: Promise<EmailSettingsSummary | null> | null = null

async function loadSettings(): Promise<EmailSettingsSummary | null> {
  if (cachedSettings) return cachedSettings
  if (!inflight) {
    inflight = fetch('/api/settings/email')
      .then((r) => r.json())
      .then((data) => {
        cachedSettings = data.settings ?? null
        return cachedSettings
      })
      .catch(() => null)
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

export function SendSessionReminderButton({
  sessionId,
  patientHasEmail,
}: SendSessionReminderButtonProps) {
  const [settings, setSettings] = useState<EmailSettingsSummary | null>(cachedSettings)
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null
  )

  useEffect(() => {
    if (!settings) {
      void loadSettings().then(setSettings)
    }
  }, [settings])

  const ready = Boolean(settings?.isEnabled && settings?.hasAppPassword)
  const disabled = !ready || !patientHasEmail || sending

  const tooltip = !ready
    ? 'Configure o e-mail em Configurações primeiro.'
    : !patientHasEmail
      ? 'Paciente não tem e-mail cadastrado.'
      : 'Enviar lembrete por e-mail'

  async function handleClick() {
    setFeedback(null)
    setSending(true)
    try {
      const response = await fetch(`/api/sessions/${sessionId}/email-reminder`, {
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
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        title={tooltip}
        aria-label="Enviar aviso por e-mail"
        className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 font-body text-[13px] font-semibold text-foreground transition-colors duration-[180ms] hover:border-primary/40 hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        {sending ? 'Enviando…' : 'Enviar aviso'}
      </button>
      {feedback ? (
        <span
          className={
            feedback.kind === 'success'
              ? 'font-body text-[11.5px] text-primary'
              : 'font-body text-[11.5px] text-danger'
          }
        >
          {feedback.message}
        </span>
      ) : null}
    </div>
  )
}
