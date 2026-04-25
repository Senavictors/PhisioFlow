'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, CircleDollarSign } from 'lucide-react'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { ThemedSelect } from '@/components/ui/themed-select'
import { cn } from '@/lib/utils'
import {
  ATTENDANCE_TYPE_LABELS,
  PRICING_MODEL_LABELS,
  SPECIALTY_LABELS,
  THERAPY_AREA_LABELS,
} from '@/lib/clinical-labels'

type AttendanceType = 'CLINIC' | 'HOME_CARE' | 'HOSPITAL' | 'CORPORATE' | 'ONLINE'
type PricingModel = 'PER_SESSION' | 'PACKAGE'

interface WorkplaceSummary {
  id: string
  name: string
  defaultAttendanceType: AttendanceType
}

interface TreatmentPlanFormData {
  workplaceId: string
  area: string
  specialties: string[]
  attendanceType: AttendanceType
  pricingModel: PricingModel
  sessionPrice: string
  totalSessions: string
  packageAmount: string
  startsAt: string
  endsAt: string
  notes: string
}

export interface TreatmentPlanFormInitialValues {
  id: string
  workplaceId: string
  area: string
  specialties: string[]
  attendanceType: AttendanceType
  pricingModel: PricingModel
  sessionPrice?: unknown
  totalSessions?: number | null
  packageAmount?: unknown
  startsAt?: Date | string | null
  endsAt?: Date | string | null
  notes?: string | null
}

interface TreatmentPlanFormProps {
  patientId: string
  mode?: 'create' | 'edit'
  initialValues?: TreatmentPlanFormInitialValues
}

const AREA_OPTIONS = Object.entries(THERAPY_AREA_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const ATTENDANCE_OPTIONS = Object.entries(ATTENDANCE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const PRICING_OPTIONS = Object.entries(PRICING_MODEL_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const SPECIALTY_OPTIONS = Object.entries(SPECIALTY_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const inputClass = cn(
  'w-full rounded-xl border border-border bg-input px-3.5 py-2.5',
  'font-body text-[14px] text-foreground placeholder:text-muted-foreground',
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
  'transition-colors duration-[180ms]'
)

function formatDateValue(value?: Date | string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function numberString(value: unknown) {
  if (value === null || value === undefined) return ''
  return String(value)
}

function buildInitialValues(initialValues?: TreatmentPlanFormInitialValues): TreatmentPlanFormData {
  if (initialValues) {
    return {
      workplaceId: initialValues.workplaceId,
      area: initialValues.area,
      specialties: initialValues.specialties ?? [],
      attendanceType: initialValues.attendanceType,
      pricingModel: initialValues.pricingModel,
      sessionPrice: numberString(initialValues.sessionPrice),
      totalSessions: numberString(initialValues.totalSessions),
      packageAmount: numberString(initialValues.packageAmount),
      startsAt: formatDateValue(initialValues.startsAt),
      endsAt: formatDateValue(initialValues.endsAt),
      notes: initialValues.notes ?? '',
    }
  }

  return {
    workplaceId: '',
    area: 'ORTOPEDICA',
    specialties: [],
    attendanceType: 'CLINIC',
    pricingModel: 'PER_SESSION',
    sessionPrice: '',
    totalSessions: '',
    packageAmount: '',
    startsAt: '',
    endsAt: '',
    notes: '',
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

export function TreatmentPlanForm({
  patientId,
  mode = 'create',
  initialValues,
}: TreatmentPlanFormProps) {
  const router = useRouter()
  const isEdit = mode === 'edit' && Boolean(initialValues)
  const [form, setForm] = useState<TreatmentPlanFormData>(() => buildInitialValues(initialValues))
  const [workplaces, setWorkplaces] = useState<WorkplaceSummary[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof TreatmentPlanFormData, string>>>({})
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch('/api/workplaces')
      .then((response) => response.json())
      .then((data) => {
        const list: WorkplaceSummary[] = data.workplaces ?? []
        setWorkplaces(list)

        if (!isEdit && list.length > 0) {
          const first = list[0]
          setForm((previous) => ({
            ...previous,
            workplaceId: previous.workplaceId || first.id,
            attendanceType: previous.attendanceType || first.defaultAttendanceType,
          }))
        }
      })
      .catch(() => undefined)
  }, [isEdit])

  function set<K extends keyof TreatmentPlanFormData>(key: K, value: TreatmentPlanFormData[K]) {
    setForm((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => ({ ...previous, [key]: undefined }))
  }

  function toggleSpecialty(value: string) {
    setForm((previous) => ({
      ...previous,
      specialties: previous.specialties.includes(value)
        ? previous.specialties.filter((item) => item !== value)
        : [...previous.specialties, value],
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setServerError('')
    setIsLoading(true)

    const body = {
      workplaceId: form.workplaceId,
      area: form.area,
      specialties: form.specialties,
      attendanceType: form.attendanceType,
      pricingModel: form.pricingModel,
      sessionPrice: form.sessionPrice ? Number(form.sessionPrice) : undefined,
      totalSessions: form.totalSessions ? Number(form.totalSessions) : undefined,
      packageAmount: form.packageAmount ? Number(form.packageAmount) : undefined,
      startsAt: form.startsAt || undefined,
      endsAt: form.endsAt || undefined,
      notes: form.notes,
    }

    try {
      const url = isEdit
        ? `/api/treatment-plans/${initialValues!.id}`
        : `/api/patients/${patientId}/treatment-plans`
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (data.errors) {
          const fieldErrors: typeof errors = {}
          for (const [key, value] of Object.entries(data.errors)) {
            fieldErrors[key as keyof TreatmentPlanFormData] = (value as string[])[0]
          }
          setErrors(fieldErrors)
        } else {
          setServerError(data.message ?? 'Erro ao salvar plano')
        }
        return
      }

      router.push(`/pacientes/${patientId}`)
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  const submitLabel = isLoading ? 'Salvando...' : isEdit ? 'Salvar alteracoes' : 'Criar plano'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {serverError ? (
        <div className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 font-body text-[13px] text-danger">
          {serverError}
        </div>
      ) : null}

      <section className="space-y-5 rounded-[18px] border border-border bg-card p-5 sm:p-6">
        <div>
          <h2 className="font-display text-[18px] font-bold text-foreground">Base do tratamento</h2>
          <p className="mt-1 font-body text-[13px] text-muted-foreground">
            Defina area, especialidades, local e modalidade principal.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Area *" error={errors.area}>
            <ThemedSelect
              value={form.area}
              onChange={(next) => set('area', next)}
              options={AREA_OPTIONS}
              ariaLabel="Area terapeutica"
            />
          </Field>

          <Field label="Local *" error={errors.workplaceId}>
            <ThemedSelect
              value={form.workplaceId}
              onChange={(next) => {
                const selected = workplaces.find((workplace) => workplace.id === next)
                set('workplaceId', next)
                if (selected) set('attendanceType', selected.defaultAttendanceType)
              }}
              options={[
                { value: '', label: 'Selecionar local' },
                ...workplaces.map((workplace) => ({ value: workplace.id, label: workplace.name })),
              ]}
              ariaLabel="Local de trabalho"
            />
          </Field>

          <Field label="Modalidade *" error={errors.attendanceType}>
            <ThemedSelect
              value={form.attendanceType}
              onChange={(next) => set('attendanceType', next as AttendanceType)}
              options={ATTENDANCE_OPTIONS}
              ariaLabel="Modalidade"
            />
          </Field>

          <Field label="Cobranca *" error={errors.pricingModel}>
            <ThemedSelect
              value={form.pricingModel}
              onChange={(next) => set('pricingModel', next as PricingModel)}
              options={PRICING_OPTIONS}
              ariaLabel="Modelo de cobranca"
            />
          </Field>
        </div>

        <div className="space-y-2">
          <p className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Especialidades
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {SPECIALTY_OPTIONS.map((option) => {
              const checked = form.specialties.includes(option.value)
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 font-body text-[12.5px] font-semibold transition-colors',
                    checked
                      ? 'border-primary bg-primary-soft text-primary-soft-fg'
                      : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSpecialty(option.value)}
                    className="h-4 w-4 accent-primary"
                  />
                  {option.label}
                </label>
              )
            })}
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-[18px] border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <CircleDollarSign className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-[18px] font-bold text-foreground">
              Condicao comercial
            </h2>
            <p className="mt-1 font-body text-[13px] text-muted-foreground">
              Valores ficam prontos para a fase financeira, sem gerar pagamentos ainda.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {form.pricingModel === 'PER_SESSION' ? (
            <Field label="Valor por sessao" error={errors.sessionPrice}>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.sessionPrice}
                onChange={(event) => set('sessionPrice', event.target.value)}
                placeholder="0,00"
              />
            </Field>
          ) : (
            <>
              <Field label="Total de sessoes *" error={errors.totalSessions}>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={inputClass}
                  value={form.totalSessions}
                  onChange={(event) => set('totalSessions', event.target.value)}
                  placeholder="10"
                />
              </Field>

              <Field label="Valor do pacote" error={errors.packageAmount}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={form.packageAmount}
                  onChange={(event) => set('packageAmount', event.target.value)}
                  placeholder="0,00"
                />
              </Field>
            </>
          )}
        </div>
      </section>

      <section className="space-y-5 rounded-[18px] border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-[18px] font-bold text-foreground">Periodo</h2>
            <p className="mt-1 font-body text-[13px] text-muted-foreground">
              Opcional para delimitar ciclos terapeuticos ou pacotes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Inicio" error={errors.startsAt}>
            <DateTimePicker
              mode="date"
              value={form.startsAt}
              onChange={(next) => set('startsAt', next)}
            />
          </Field>

          <Field label="Fim" error={errors.endsAt}>
            <DateTimePicker
              mode="date"
              value={form.endsAt}
              onChange={(next) => set('endsAt', next)}
            />
          </Field>
        </div>

        <Field label="Notas" error={errors.notes}>
          <textarea
            className={cn(inputClass, 'min-h-[96px] resize-y')}
            value={form.notes}
            onChange={(event) => set('notes', event.target.value)}
            placeholder="Objetivos, restricoes e combinados do tratamento..."
          />
        </Field>
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
