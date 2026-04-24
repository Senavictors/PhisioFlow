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
  address: string
  neighborhood: string
  city: string
  homeCareNotes: string
  homeCarePriority: string
}

interface PatientFormProps {
  initialData?: Partial<PatientFormData>
  patientId?: string
}

const HOME_CARE_PRIORITIES = [
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'Prioritário' },
  { value: 'URGENT', label: 'Urgente' },
]

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
    address: initialData?.address ?? '',
    neighborhood: initialData?.neighborhood ?? '',
    city: initialData?.city ?? '',
    homeCareNotes: initialData?.homeCareNotes ?? '',
    homeCarePriority: initialData?.homeCarePriority ?? 'NORMAL',
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

      <section className="space-y-5 rounded-[18px] border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display font-bold text-[16px] text-foreground">Dados Pessoais</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
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

          <div className="md:col-span-2">
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

      <section className="space-y-5 rounded-[18px] border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display font-bold text-[16px] text-foreground">
          Classificação Clínica
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <section className="space-y-5 rounded-[18px] border border-border bg-card p-5 sm:p-6">
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <section className="space-y-5 rounded-[18px] border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-bold text-[16px] text-foreground">
            Logística Domiciliar
          </h2>
          {form.area === 'HOME_CARE' && (
            <span className="rounded-full bg-warning-soft px-2.5 py-1 font-body text-[11px] font-semibold text-warning">
              HOME CARE
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Endereço" error={errors.address}>
              <input
                className={inputClass}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="Logradouro e número"
              />
            </Field>
          </div>

          <Field label="Bairro" error={errors.neighborhood}>
            <input
              className={inputClass}
              value={form.neighborhood}
              onChange={(e) => set('neighborhood', e.target.value)}
              placeholder="Bairro"
            />
          </Field>

          <Field label="Cidade" error={errors.city}>
            <input
              className={inputClass}
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="Cidade"
            />
          </Field>
        </div>

        <Field label="Instruções de acesso" error={errors.homeCareNotes}>
          <textarea
            className={cn(inputClass, 'min-h-[80px] resize-y')}
            value={form.homeCareNotes}
            onChange={(e) => set('homeCareNotes', e.target.value)}
            placeholder="Portaria, interfone, ponto de referência..."
          />
        </Field>

        <Field label="Prioridade" error={errors.homeCarePriority}>
          <select
            className={inputClass}
            value={form.homeCarePriority}
            onChange={(e) => set('homeCarePriority', e.target.value)}
          >
            {HOME_CARE_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <div className="pt-1">
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {isEditing && patientId ? <ArchivePatientButton patientId={patientId} /> : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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
              {isLoading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar paciente'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
