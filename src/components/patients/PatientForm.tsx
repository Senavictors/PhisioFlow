'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArchivePatientButton } from '@/components/patients/ArchivePatientButton'
import { cn } from '@/lib/utils'

interface PatientFormData {
  name: string
  birthDate: string
  phone: string
  email: string
  classification: string
  area: string
  notes: string
  mainComplaint: string
  medicalHistory: string
  medications: string
  allergies: string
}

interface PatientFormProps {
  initialData?: Partial<PatientFormData>
  patientId?: string
}

const AREAS = [
  { value: 'PILATES', label: 'Pilates' },
  { value: 'MOTOR', label: 'Fisioterapia Motora' },
  { value: 'AESTHETIC', label: 'Fisioterapia Estética' },
  { value: 'HOME_CARE', label: 'Atendimento Domiciliar' },
]

const CLASSIFICATIONS = [
  { value: 'STANDARD', label: 'Padrão' },
  { value: 'ELDERLY', label: 'Idoso' },
  { value: 'PCD', label: 'PCD' },
  { value: 'POST_ACCIDENT', label: 'Pós-acidente' },
]

function Field({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </label>
      {children}
      {error && <p className="font-body text-[12px] text-danger">{error}</p>}
    </div>
  )
}

const inputClass = cn(
  'w-full px-3.5 py-2.5 rounded-xl bg-input border border-border',
  'font-body text-[14px] text-foreground placeholder:text-muted-foreground',
  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary',
  'transition-colors duration-[180ms]'
)

export function PatientForm({ initialData, patientId }: PatientFormProps) {
  const router = useRouter()
  const isEditing = !!patientId

  const [form, setForm] = useState<PatientFormData>({
    name: initialData?.name ?? '',
    birthDate: initialData?.birthDate ?? '',
    phone: initialData?.phone ?? '',
    email: initialData?.email ?? '',
    classification: initialData?.classification ?? 'STANDARD',
    area: initialData?.area ?? '',
    notes: initialData?.notes ?? '',
    mainComplaint: initialData?.mainComplaint ?? '',
    medicalHistory: initialData?.medicalHistory ?? '',
    medications: initialData?.medications ?? '',
    allergies: initialData?.allergies ?? '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function set(key: keyof PatientFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setServerError('')

    const url = isEditing ? `/api/patients/${patientId}` : '/api/patients'
    const method = isEditing ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          const fieldErrors: typeof errors = {}
          for (const [k, v] of Object.entries(data.errors)) {
            fieldErrors[k as keyof PatientFormData] = (v as string[])[0]
          }
          setErrors(fieldErrors)
        } else {
          setServerError(data.message ?? 'Erro ao salvar paciente')
        }
        return
      }

      const id = isEditing ? patientId : data.patient.id
      router.push(`/pacientes/${id}`)
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {serverError && (
        <div className="px-4 py-3 rounded-xl bg-danger-soft border border-danger/20 font-body text-[13px] text-danger">
          {serverError}
        </div>
      )}

      <section className="bg-card border border-border rounded-[18px] p-6 space-y-5">
        <h2 className="font-display font-bold text-[16px] text-foreground">Dados Pessoais</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nome completo *" error={errors.name}>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Nome do paciente"
              />
            </Field>
          </div>

          <Field label="Data de nascimento" error={errors.birthDate}>
            <input
              type="date"
              className={inputClass}
              value={form.birthDate}
              onChange={(e) => set('birthDate', e.target.value)}
            />
          </Field>

          <Field label="Telefone" error={errors.phone}>
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </Field>

          <div className="col-span-2">
            <Field label="E-mail" error={errors.email}>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="bg-card border border-border rounded-[18px] p-6 space-y-5">
        <h2 className="font-display font-bold text-[16px] text-foreground">
          Classificação Clínica
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Área terapêutica *" error={errors.area}>
            <select
              className={inputClass}
              value={form.area}
              onChange={(e) => set('area', e.target.value)}
            >
              <option value="">Selecionar área</option>
              {AREAS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Classificação" error={errors.classification}>
            <select
              className={inputClass}
              value={form.classification}
              onChange={(e) => set('classification', e.target.value)}
            >
              {CLASSIFICATIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Observações gerais" error={errors.notes}>
          <textarea
            className={cn(inputClass, 'min-h-[80px] resize-y')}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Observações sobre o paciente..."
          />
        </Field>
      </section>

      <section className="bg-card border border-border rounded-[18px] p-6 space-y-5">
        <h2 className="font-display font-bold text-[16px] text-foreground">Prontuário</h2>

        <Field label="Queixa principal" error={errors.mainComplaint}>
          <textarea
            className={cn(inputClass, 'min-h-[80px] resize-y')}
            value={form.mainComplaint}
            onChange={(e) => set('mainComplaint', e.target.value)}
            placeholder="Descreva a queixa principal do paciente..."
          />
        </Field>

        <Field label="Histórico médico" error={errors.medicalHistory}>
          <textarea
            className={cn(inputClass, 'min-h-[80px] resize-y')}
            value={form.medicalHistory}
            onChange={(e) => set('medicalHistory', e.target.value)}
            placeholder="Doenças preexistentes, cirurgias, etc..."
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Medicamentos em uso" error={errors.medications}>
            <textarea
              className={cn(inputClass, 'min-h-[72px] resize-y')}
              value={form.medications}
              onChange={(e) => set('medications', e.target.value)}
              placeholder="Liste os medicamentos..."
            />
          </Field>

          <Field label="Alergias" error={errors.allergies}>
            <textarea
              className={cn(inputClass, 'min-h-[72px] resize-y')}
              value={form.allergies}
              onChange={(e) => set('allergies', e.target.value)}
              placeholder="Alergias conhecidas..."
            />
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 pt-2">
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {isEditing && patientId ? <ArchivePatientButton patientId={patientId} /> : null}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl font-body text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-[180ms]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-body text-[13px] font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors duration-[180ms] shadow-glow"
            >
              {isLoading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar paciente'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
