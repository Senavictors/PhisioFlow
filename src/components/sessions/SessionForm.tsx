'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDateTimeLocalInputValue } from '@/lib/date'
import { cn } from '@/lib/utils'

interface SessionFormData {
  date: string
  duration: string
  type: 'PRESENTIAL' | 'HOME_CARE'
  status: 'AGENDADO' | 'REALIZADO'
  subjective: string
  objective: string
  assessment: string
  plan: string
}

interface SessionFormProps {
  patient: {
    id: string
    name: string
    area: string
  }
}

const sessionTypeOptions = [
  { value: 'PRESENTIAL', label: 'Presencial' },
  { value: 'HOME_CARE', label: 'Domiciliar' },
] as const

const sessionStatusOptions = [
  { value: 'AGENDADO', label: 'Agendado' },
  { value: 'REALIZADO', label: 'Realizado' },
] as const

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

export function SessionForm({ patient }: SessionFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<SessionFormData>({
    date: buildDefaultDate(),
    duration: '50',
    type: patient.area === 'HOME_CARE' ? 'HOME_CARE' : 'PRESENTIAL',
    status: 'AGENDADO',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof SessionFormData, string>>>({})
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function set<K extends keyof SessionFormData>(key: K, value: SessionFormData[K]) {
    setForm((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => ({ ...previous, [key]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setServerError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          patientId: patient.id,
          date: new Date(form.date).toISOString(),
          duration: Number(form.duration),
        }),
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

      router.push('/atendimentos')
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

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
              Registre data, duração, tipo e status inicial da sessão.
            </p>
          </div>
          <div className="rounded-full bg-primary-soft px-3 py-1.5 font-body text-[11px] font-semibold text-primary-soft-fg">
            {patient.name}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Data e hora *" error={errors.date}>
            <input
              type="datetime-local"
              className={inputClass}
              value={form.date}
              onChange={(event) => set('date', event.target.value)}
            />
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
            <select
              className={inputClass}
              value={form.type}
              onChange={(event) => set('type', event.target.value as SessionFormData['type'])}
            >
              {sessionTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status *" error={errors.status}>
            <select
              className={inputClass}
              value={form.status}
              onChange={(event) => set('status', event.target.value as SessionFormData['status'])}
            >
              {sessionStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
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
          {isLoading ? 'Salvando...' : 'Salvar atendimento'}
        </button>
      </div>
    </form>
  )
}
