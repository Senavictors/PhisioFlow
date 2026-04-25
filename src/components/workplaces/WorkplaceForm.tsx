'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ThemedSelect } from '@/components/ui/themed-select'

type WorkplaceKind = 'OWN_CLINIC' | 'PARTNER_CLINIC' | 'PARTICULAR' | 'ONLINE'
type AttendanceType = 'CLINIC' | 'HOME_CARE' | 'HOSPITAL' | 'CORPORATE' | 'ONLINE'

interface WorkplaceFormData {
  name: string
  kind: WorkplaceKind
  defaultAttendanceType: AttendanceType
  address: string
  notes: string
}

const kindOptions: Array<{ value: WorkplaceKind; label: string }> = [
  { value: 'OWN_CLINIC', label: 'Própria clínica' },
  { value: 'PARTNER_CLINIC', label: 'Clínica parceira' },
  { value: 'PARTICULAR', label: 'Particular' },
  { value: 'ONLINE', label: 'Online' },
]

const attendanceOptions: Array<{ value: AttendanceType; label: string }> = [
  { value: 'CLINIC', label: 'Clínica' },
  { value: 'HOME_CARE', label: 'Domiciliar' },
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'CORPORATE', label: 'Corporativo' },
  { value: 'ONLINE', label: 'Online' },
]

export interface WorkplaceFormInitialValues {
  id: string
  name: string
  kind: WorkplaceKind
  defaultAttendanceType: AttendanceType
  address?: string | null
  notes?: string | null
}

interface WorkplaceFormProps {
  mode: 'create' | 'edit'
  initialValues?: WorkplaceFormInitialValues
  onSuccess: () => void
  onCancel: () => void
}

const inputClass = cn(
  'w-full rounded-xl border border-border bg-input px-3.5 py-2.5',
  'font-body text-[14px] text-foreground placeholder:text-muted-foreground',
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
  'transition-colors duration-[180ms]'
)

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

export function WorkplaceForm({ mode, initialValues, onSuccess, onCancel }: WorkplaceFormProps) {
  const [form, setForm] = useState<WorkplaceFormData>({
    name: initialValues?.name ?? '',
    kind: initialValues?.kind ?? 'OWN_CLINIC',
    defaultAttendanceType: initialValues?.defaultAttendanceType ?? 'CLINIC',
    address: initialValues?.address ?? '',
    notes: initialValues?.notes ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof WorkplaceFormData, string>>>({})
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function set<K extends keyof WorkplaceFormData>(key: K, value: WorkplaceFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setServerError('')
    setIsLoading(true)

    try {
      const url = mode === 'edit' ? `/api/workplaces/${initialValues!.id}` : '/api/workplaces'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          kind: form.kind,
          defaultAttendanceType: form.defaultAttendanceType,
          address: form.address || undefined,
          notes: form.notes || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          const fieldErrors: typeof errors = {}
          for (const [key, value] of Object.entries(data.errors)) {
            fieldErrors[key as keyof WorkplaceFormData] = (value as string[])[0]
          }
          setErrors(fieldErrors)
        } else {
          setServerError(data.message ?? 'Erro ao salvar local')
        }
        return
      }

      onSuccess()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {serverError ? (
        <div className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 font-body text-[13px] text-danger">
          {serverError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Nome *" error={errors.name}>
            <input
              type="text"
              className={inputClass}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ex: Clínica Movimento, Atendimento Particular"
              autoFocus
            />
          </Field>
        </div>

        <Field label="Tipo do local *" error={errors.kind}>
          <ThemedSelect
            value={form.kind}
            onChange={(next) => set('kind', next as WorkplaceKind)}
            options={kindOptions}
            ariaLabel="Tipo do local"
          />
        </Field>

        <Field label="Tipo de atendimento padrão *" error={errors.defaultAttendanceType}>
          <ThemedSelect
            value={form.defaultAttendanceType}
            onChange={(next) => set('defaultAttendanceType', next as AttendanceType)}
            options={attendanceOptions}
            ariaLabel="Tipo de atendimento padrão"
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Endereço" error={errors.address}>
            <input
              type="text"
              className={inputClass}
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Rua, número — opcional"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Observações" error={errors.notes}>
            <textarea
              className={cn(inputClass, 'min-h-[80px] resize-y')}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Informações adicionais sobre este local"
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-xl px-5 py-2.5 font-body text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:w-auto"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-primary px-6 py-2.5 font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover disabled:opacity-50 sm:w-auto"
        >
          {isLoading ? 'Salvando...' : mode === 'edit' ? 'Salvar alterações' : 'Adicionar local'}
        </button>
      </div>
    </form>
  )
}
