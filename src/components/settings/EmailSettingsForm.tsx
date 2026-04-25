'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SafeEmailSettings {
  provider: 'GMAIL_SMTP'
  fromName: string
  smtpUser: string
  isEnabled: boolean
  sendDocumentsByDefault: boolean
  sendSessionRemindersByDefault: boolean
  hasAppPassword: boolean
}

interface EmailSettingsFormProps {
  initialSettings: SafeEmailSettings | null
}

const inputClass = cn(
  'w-full rounded-xl border border-border bg-input px-3.5 py-2.5',
  'font-body text-[14px] text-foreground placeholder:text-muted-foreground',
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
  'transition-colors duration-[180ms]'
)

export function EmailSettingsForm({ initialSettings }: EmailSettingsFormProps) {
  const router = useRouter()
  const [fromName, setFromName] = useState(initialSettings?.fromName ?? '')
  const [smtpUser, setSmtpUser] = useState(initialSettings?.smtpUser ?? '')
  const [appPassword, setAppPassword] = useState('')
  const [isEnabled, setIsEnabled] = useState(initialSettings?.isEnabled ?? false)
  const [sendDocumentsByDefault, setSendDocumentsByDefault] = useState(
    initialSettings?.sendDocumentsByDefault ?? false
  )
  const [sendRemindersByDefault, setSendRemindersByDefault] = useState(
    initialSettings?.sendSessionRemindersByDefault ?? false
  )
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)

  const hasAppPassword = initialSettings?.hasAppPassword ?? false

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    setSaving(true)
    try {
      const response = await fetch('/api/settings/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromName,
          smtpUser,
          appPassword: appPassword || undefined,
          isEnabled,
          sendDocumentsByDefault,
          sendSessionRemindersByDefault: sendRemindersByDefault,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        const fieldErrors = data.errors as Record<string, string[]> | undefined
        const firstError = fieldErrors ? Object.values(fieldErrors)[0]?.[0] : data.message
        setFeedback({ kind: 'error', message: firstError ?? 'Erro ao salvar configurações' })
        return
      }
      setAppPassword('')
      setFeedback({ kind: 'success', message: 'Configurações salvas.' })
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleSendTest() {
    setFeedback(null)
    setTesting(true)
    try {
      const response = await fetch('/api/settings/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await response.json()
      if (!response.ok) {
        setFeedback({ kind: 'error', message: data.message ?? 'Falha no teste' })
        return
      }
      setFeedback({ kind: 'success', message: 'E-mail de teste enviado para você mesmo.' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[20px] border border-border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="font-display text-[18px] font-bold text-foreground">
          Conexão Gmail SMTP
        </h2>
        <p className="mt-1 font-body text-[13px] text-muted-foreground">
          Os envios saem da sua conta. A Senha de App é criptografada antes de ser salva no banco.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Nome do remetente *
          </span>
          <input
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            className={inputClass}
            placeholder="Ex.: Dra. Júlia Andrade"
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            E-mail Gmail *
          </span>
          <input
            type="email"
            value={smtpUser}
            onChange={(e) => setSmtpUser(e.target.value)}
            className={inputClass}
            placeholder="seuemail@gmail.com"
            required
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Senha de App {hasAppPassword ? <span className="text-primary">(já cadastrada)</span> : '*'}
        </span>
        <input
          type="password"
          value={appPassword}
          onChange={(e) => setAppPassword(e.target.value)}
          className={inputClass}
          placeholder={hasAppPassword ? '••••• Deixe em branco para manter' : 'Cole os 16 caracteres gerados no Google'}
          autoComplete="new-password"
        />
        <span className="font-body text-[11.5px] text-muted-foreground">
          Os espaços que o Google insere são removidos automaticamente.
        </span>
      </label>

      <div className="space-y-3 rounded-xl border border-border bg-background/60 p-4">
        <ToggleField
          label="Habilitar envios"
          description="Quando desativado, os botões de envio ficam bloqueados."
          checked={isEnabled}
          onChange={setIsEnabled}
        />
        <ToggleField
          label="Marcar 'enviar por e-mail' nos documentos por padrão"
          description="No modal de gerar documento, a opção de envio aparece pré-marcada."
          checked={sendDocumentsByDefault}
          onChange={setSendDocumentsByDefault}
        />
        <ToggleField
          label="Marcar 'enviar lembrete' nos atendimentos por padrão"
          description="Sugere o envio de aviso ao confirmar agendamentos."
          checked={sendRemindersByDefault}
          onChange={setSendRemindersByDefault}
        />
      </div>

      {feedback ? (
        <div
          className={cn(
            'rounded-xl px-4 py-3 font-body text-[13px]',
            feedback.kind === 'success'
              ? 'bg-primary-soft text-primary-soft-fg'
              : 'border border-danger/20 bg-danger-soft text-danger'
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={handleSendTest}
          disabled={testing || saving || !hasAppPassword}
          className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 font-body text-[13px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft disabled:opacity-60"
        >
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Enviar teste
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Salvar configurações
        </button>
      </div>
    </form>
  )
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-primary"
      />
      <span>
        <span className="block font-body text-[13px] font-semibold text-foreground">{label}</span>
        <span className="block font-body text-[12px] text-muted-foreground">{description}</span>
      </span>
    </label>
  )
}
