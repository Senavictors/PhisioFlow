'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarCheck2, Mail } from 'lucide-react'
import { formatDateTimeLocalInputValue } from '@/lib/date'
import { cn } from '@/lib/utils'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { ThemedSelect } from '@/components/ui/themed-select'

type SessionStatus = 'AGENDADO' | 'REALIZADO' | 'CANCELADO'
type SessionType = 'PRESENTIAL' | 'HOME_CARE'

interface SessionFormData {
  date: string
  duration: string
  type: SessionType
  status: SessionStatus
  subjective: string
  objective: string
  assessment: string
  plan: string
  syncWithGoogleCalendar: boolean
}

export interface SessionFormInitialValues {
  id: string
  date: Date | string
  duration: number
  type: SessionType
  status: SessionStatus
  subjective?: string | null
  objective?: string | null
  assessment?: string | null
  plan?: string | null
  syncWithGoogleCalendar?: boolean
}

interface SessionFormProps {
  patient: {
    id: string
    name: string
    area: string
    email?: string | null
  }
  mode?: 'create' | 'edit'
  initialValues?: SessionFormInitialValues
}

interface EmailSummary {
  isEnabled: boolean
  hasAppPassword: boolean
  sendSessionRemindersByDefault: boolean
}

const sessionTypeOptions: Array<{ value: SessionType; label: string }> = [
  { value: 'PRESENTIAL', label: 'Presencial' },
  { value: 'HOME_CARE', label: 'Domiciliar' },
]

const createStatusOptions: Array<{ value: SessionStatus; label: string }> = [
  { value: 'AGENDADO', label: 'Agendado' },
  { value: 'REALIZADO', label: 'Realizado' },
]

const editStatusOptions: Array<{ value: SessionStatus; label: string }> = [
  { value: 'AGENDADO', label: 'Agendado' },
  { value: 'REALIZADO', label: 'Realizado' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

const soapSections = [
  {
    key: 'subjective',
    badge: 'S',
    title: 'Subjetivo',
    placeholder: 'Queixa principal e sintomas relatados pelo paciente',
  },
  {
    key: 'objective',
    badge: 'O',
    title: 'Objetivo',
    placeholder: 'Achados clínicos, testes realizados e medidas observadas',
  },
  {
    key: 'assessment',
    badge: 'A',
    title: 'Avaliação',
    placeholder: 'Diagnóstico funcional e hipótese clínica',
  },
  {
    key: 'plan',
    badge: 'P',
    title: 'Plano',
    placeholder: 'Condutas, exercícios prescritos e próximos passos',
  },
] as const

function buildDefaultDate() {
  const date = new Date()
  date.setHours(date.getHours() + 1, 0, 0, 0)
  return formatDateTimeLocalInputValue(date)
}

function buildInitialFormData(
  patient: SessionFormProps['patient'],
  initialValues?: SessionFormInitialValues
): SessionFormData {
  if (initialValues) {
    return {
      date: formatDateTimeLocalInputValue(new Date(initialValues.date)),
      duration: String(initialValues.duration),
      type: initialValues.type,
      status: initialValues.status,
      subjective: initialValues.subjective ?? '',
      objective: initialValues.objective ?? '',
      assessment: initialValues.assessment ?? '',
      plan: initialValues.plan ?? '',
      syncWithGoogleCalendar: initialValues.syncWithGoogleCalendar ?? false,
    }
  }

  return {
    date: buildDefaultDate(),
    duration: '50',
    type: patient.area === 'HOME_CARE' ? 'HOME_CARE' : 'PRESENTIAL',
    status: 'AGENDADO',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    syncWithGoogleCalendar: false,
  }
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </label>
      {children}
      {error ? <p className="font-body text-[12px] text-danger">{error}</p> : null}
    </div>
  )
}

const inputClass = cn(
  'w-full rounded-xl border border-border bg-input px-3.5 py-2.5',
  'font-body text-[14px] text-foreground placeholder:text-muted-foreground',
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
  'transition-colors duration-[180ms]'
)

export function SessionForm({ patient, mode = 'create', initialValues }: SessionFormProps) {
  const router = useRouter()
  const isEdit = mode === 'edit' && Boolean(initialValues)
  const [form, setForm] = useState<SessionFormData>(() =>
    buildInitialFormData(patient, initialValues)
  )
  const [errors, setErrors] = useState<Partial<Record<keyof SessionFormData, string>>>({})
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSummary, setEmailSummary] = useState<EmailSummary | null>(null)
  const [sendReminder, setSendReminder] = useState(false)
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [loadingCalendarSettings, setLoadingCalendarSettings] = useState(true)

  useEffect(() => {
    fetch('/api/settings/email')
      .then((r) => r.json())
      .then((data) => {
        const settings = data.settings as EmailSummary | null
        setEmailSummary(settings)
        if (
          settings?.isEnabled &&
          settings.hasAppPassword &&
          settings.sendSessionRemindersByDefault &&
          !isEdit
        ) {
          setSendReminder(true)
        }
      })
      .catch(() => setEmailSummary(null))
  }, [isEdit])

  const emailReady = Boolean(emailSummary?.isEnabled && emailSummary?.hasAppPassword)
  const patientHasEmail = Boolean(patient.email)
  const canSendReminder = emailReady && patientHasEmail
  const statusOptions = isEdit ? editStatusOptions : createStatusOptions

  function set<K extends keyof SessionFormData>(key: K, value: SessionFormData[K]) {
    setForm((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => ({ ...previous, [key]: undefined }))
  }

  useEffect(() => {
    fetch('/api/integrations/google-calendar')
      .then((response) => response.json())
      .then((data) => {
        const connection = data.connection
        setCalendarConnected(Boolean(connection?.connected))
        setForm((previous) => ({
          ...previous,
          syncWithGoogleCalendar: isEdit
            ? previous.syncWithGoogleCalendar
            : Boolean(connection?.connected && connection?.syncNewSessionsByDefault),
        }))
      })
      .catch(() => setCalendarConnected(false))
      .finally(() => setLoadingCalendarSettings(false))
  }, [isEdit])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setServerError('')
    setIsLoading(true)

    try {
      const url = isEdit ? `/api/sessions/${initialValues!.id}` : '/api/sessions'
      const method = isEdit ? 'PUT' : 'POST'

      const body: Record<string, unknown> = {
        date: new Date(form.date).toISOString(),
        duration: Number(form.duration),
        type: form.type,
        status: form.status,
        subjective: form.subjective,
        objective: form.objective,
        assessment: form.assessment,
        plan: form.plan,
        syncWithGoogleCalendar: form.syncWithGoogleCalendar,
      }

      if (!isEdit) {
        body.patientId = patient.id
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          const fieldErrors: typeof errors = {}

          for (const [key, value] of Object.entries(data.errors)) {
            fieldErrors[key as keyof SessionFormData] = (value as string[])[0]
          }

          setErrors(fieldErrors)
        } else {
          setServerError(data.message ?? 'Erro ao salvar atendimento')
        }

        return
      }

      const createdSession = data.session ?? data
      const newId = createdSession?.id

      if (sendReminder && canSendReminder && newId && form.status === 'AGENDADO') {
        await fetch(`/api/sessions/${newId}/email-reminder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }).catch(() => undefined)
      }

      router.push('/atendimentos')
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  const submitLabel = isEdit
    ? isLoading
      ? 'Salvando...'
      : 'Salvar alterações'
    : isLoading
      ? 'Salvando...'
      : 'Salvar atendimento'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {serverError ? (
        <div className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 font-body text-[13px] text-danger">
          {serverError}
        </div>
      ) : null}

      <section className="space-y-5 rounded-[18px] border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-[18px] font-bold text-foreground">
              Dados do atendimento
            </h2>
            <p className="mt-1 font-body text-[13px] text-muted-foreground">
              {isEdit
                ? 'Atualize data, duração, tipo e status do atendimento.'
                : 'Registre data, duração, tipo e status inicial da sessão.'}
            </p>
          </div>
          <div className="rounded-full bg-primary-soft px-3 py-1.5 font-body text-[11px] font-semibold text-primary-soft-fg">
            {patient.name}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Data e hora *" error={errors.date}>
            <DateTimePicker value={form.date} onChange={(next) => set('date', next)} />
          </Field>

          <Field label="Duração (min) *" error={errors.duration}>
            <input
              type="number"
              min={15}
              step={5}
              className={inputClass}
              value={form.duration}
              onChange={(event) => set('duration', event.target.value)}
            />
          </Field>

          <Field label="Tipo *" error={errors.type}>
            <ThemedSelect
              value={form.type}
              onChange={(next) => set('type', next as SessionType)}
              options={sessionTypeOptions}
              ariaLabel="Tipo de atendimento"
            />
          </Field>

          <Field label="Status *" error={errors.status}>
            <ThemedSelect
              value={form.status}
              onChange={(next) => set('status', next as SessionStatus)}
              options={statusOptions}
              ariaLabel="Status do atendimento"
            />
          </Field>
        </div>

        <div className="rounded-[18px] border border-border bg-background/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <CalendarCheck2 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-body text-[13px] font-semibold text-foreground">
                  Google Calendar
                </p>
                <p className="mt-1 font-body text-[12px] text-muted-foreground">
                  {calendarConnected
                    ? 'Adicionar ou atualizar este atendimento na agenda conectada.'
                    : 'Conecte uma agenda para sincronizar este atendimento.'}
                </p>
              </div>
            </div>

            {loadingCalendarSettings ? (
              <span className="font-body text-[12px] text-muted-foreground">Carregando...</span>
            ) : calendarConnected ? (
              <label className="inline-flex items-center gap-2 font-body text-[13px] font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={form.syncWithGoogleCalendar}
                  onChange={(event) => set('syncWithGoogleCalendar', event.target.checked)}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                Sincronizar
              </label>
            ) : (
              <Link
                href="/configuracoes/integracoes"
                className="font-body text-[12px] font-semibold text-primary transition-colors hover:text-primary-hover"
              >
                Configurar integração
              </Link>
            )}
          </div>
        </div>

        {!isEdit && form.status === 'AGENDADO' ? (
          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-background/60 p-3">
            <input
              type="checkbox"
              checked={sendReminder}
              onChange={(event) => setSendReminder(event.target.checked)}
              disabled={!canSendReminder}
              className="mt-1 h-4 w-4 accent-primary disabled:opacity-50"
            />
            <span className="flex-1">
              <span className="flex items-center gap-1.5 font-body text-[13px] font-semibold text-foreground">
                <Mail className="h-3.5 w-3.5" />
                Enviar aviso por e-mail ao paciente
              </span>
              <span className="block font-body text-[12px] text-muted-foreground">
                {!emailReady
                  ? 'Configure seu Gmail em Configurações → E-mail.'
                  : !patientHasEmail
                    ? 'Paciente não tem e-mail cadastrado.'
                    : `O lembrete será enviado para ${patient.email} após salvar.`}
              </span>
            </span>
          </label>
        ) : null}
      </section>

      <section className="space-y-5 rounded-[18px] border border-border bg-card p-5 sm:p-6">
        <div>
          <h2 className="font-display text-[18px] font-bold text-foreground">Registro SOAP</h2>
          <p className="mt-1 font-body text-[13px] text-muted-foreground">
            Estruture a evolução clínica da sessão com observações objetivas e próximos passos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {soapSections.map((section) => (
            <div
              key={section.key}
              className="space-y-3 rounded-[18px] border border-border bg-background/70 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft font-display text-[18px] font-bold text-primary">
                  {section.badge}
                </span>
                <div>
                  <p className="font-display text-[17px] font-bold text-foreground">
                    {section.title}
                  </p>
                  <p className="font-body text-[12px] text-muted-foreground">
                    Campo opcional, mas recomendado para o prontuário.
                  </p>
                </div>
              </div>

              <textarea
                className={cn(inputClass, 'min-h-[140px] resize-y')}
                value={form[section.key]}
                onChange={(event) =>
                  set(section.key, event.target.value as SessionFormData[typeof section.key])
                }
                placeholder={section.placeholder}
              />
              {errors[section.key] ? (
                <p className="font-body text-[12px] text-danger">{errors[section.key]}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full rounded-xl px-5 py-2.5 font-body text-[13px] font-semibold text-muted-foreground transition-colors duration-[180ms] hover:bg-muted hover:text-foreground sm:w-auto"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-primary px-6 py-2.5 font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors duration-[180ms] hover:bg-primary-hover disabled:opacity-50 sm:w-auto"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
