import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ChevronLeft, Edit, FilePlus2, Mail, Phone } from 'lucide-react'
import { getSession } from '@/lib/session'
import { formatDateOnlyPtBr } from '@/lib/date'
import {
  getPatientUseCase,
  PatientNotFoundError,
} from '@/server/modules/patients/application/get-patient'

const AREA_LABELS: Record<string, string> = {
  PILATES: 'Pilates',
  MOTOR: 'Fisioterapia Motora',
  AESTHETIC: 'Fisioterapia Estética',
  HOME_CARE: 'Atendimento Domiciliar',
}

const CLASSIFICATION_LABELS: Record<string, string> = {
  ELDERLY: 'Idoso',
  PCD: 'PCD',
  POST_ACCIDENT: 'Pós-acidente',
  STANDARD: 'Padrão',
}

const AREA_COLORS: Record<string, string> = {
  PILATES: 'bg-primary-soft text-primary-soft-fg',
  MOTOR: 'bg-accent-soft text-accent-soft-fg',
  AESTHETIC: 'bg-success-soft text-success',
  HOME_CARE: 'bg-warning-soft text-warning',
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value?: string | null
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </p>
        <p className="font-body text-[14px] text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function RecordField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-1.5">
        {label}
      </p>
      <p className="font-body text-[14px] text-foreground leading-relaxed">
        {value || <span className="text-muted-foreground italic">Não informado</span>}
      </p>
    </div>
  )
}

async function loadPatient(id: string, userId: string) {
  try {
    return await getPatientUseCase(id, userId)
  } catch (err) {
    if (err instanceof PatientNotFoundError) {
      return null
    }

    throw err
  }
}

export default async function FichaClinicaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  const patient = await loadPatient(id, session.userId!)

  if (!patient) {
    notFound()
  }

  const birthFormatted = patient.birthDate ? formatDateOnlyPtBr(patient.birthDate) : null

  return (
    <div className="max-w-[1080px] space-y-6 sm:space-y-8">
      <div>
        <Link
          href="/pacientes"
          className="flex items-center gap-1.5 font-body text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Voltar para Pacientes
        </Link>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-soft">
              <span className="font-display text-[22px] font-bold text-primary">
                {patient.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-[28px] font-bold leading-tight text-foreground sm:text-[32px]">
                {patient.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 font-body text-[11px] font-semibold ${
                    AREA_COLORS[patient.area] ?? 'bg-muted text-muted-foreground'
                  }`}
                >
                  {AREA_LABELS[patient.area] ?? patient.area}
                </span>
                {patient.classification !== 'STANDARD' && (
                  <span className="px-2.5 py-1 rounded-full bg-danger-soft text-danger font-body text-[11px] font-semibold">
                    {CLASSIFICATION_LABELS[patient.classification]}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <Link
              href={`/pacientes/${id}/sessoes/nova`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover sm:w-auto"
            >
              <FilePlus2 className="h-4 w-4" />
              Registrar atendimento
            </Link>
            <Link
              href={`/pacientes/${id}/editar`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 font-body text-[13px] font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary-soft sm:w-auto"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="space-y-4 rounded-[18px] border border-border bg-card p-5 sm:p-6">
          <h2 className="font-display font-bold text-[15px] text-foreground">Dados Pessoais</h2>
          <div className="space-y-3">
            <InfoRow icon={Calendar} label="Data de nascimento" value={birthFormatted} />
            <InfoRow icon={Phone} label="Telefone" value={patient.phone} />
            <InfoRow icon={Mail} label="E-mail" value={patient.email} />
          </div>
          {patient.notes && (
            <div className="border-t border-border pt-3">
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-1.5">
                Observações
              </p>
              <p className="font-body text-[13px] text-foreground leading-relaxed">
                {patient.notes}
              </p>
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-[18px] border border-border bg-card p-5 sm:p-6">
          <h2 className="font-display font-bold text-[15px] text-foreground">Prontuário</h2>
          <div className="space-y-4">
            <RecordField label="Queixa principal" value={patient.clinicalRecord?.mainComplaint} />
            <RecordField label="Histórico médico" value={patient.clinicalRecord?.medicalHistory} />
            <RecordField label="Medicamentos em uso" value={patient.clinicalRecord?.medications} />
            <RecordField label="Alergias" value={patient.clinicalRecord?.allergies} />
          </div>
        </section>
      </div>
    </div>
  )
}
