import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Phone, Mail, Calendar, Edit } from 'lucide-react'
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
    <div className="space-y-7 max-w-[780px]">
      <div>
        <Link
          href="/pacientes"
          className="flex items-center gap-1.5 font-body text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Voltar para Pacientes
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-[22px] text-primary">
                {patient.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="font-display font-bold text-[28px] text-foreground leading-tight">
                {patient.name}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`px-2.5 py-1 rounded-full font-body text-[11px] font-semibold ${
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

          <Link
            href={`/pacientes/${id}/editar`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary-soft font-body text-[13px] font-semibold text-foreground transition-all shrink-0"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <section className="bg-card border border-border rounded-[18px] p-6 space-y-4">
          <h2 className="font-display font-bold text-[15px] text-foreground">Dados Pessoais</h2>
          <div className="space-y-3">
            <InfoRow icon={Calendar} label="Data de nascimento" value={birthFormatted} />
            <InfoRow icon={Phone} label="Telefone" value={patient.phone} />
            <InfoRow icon={Mail} label="E-mail" value={patient.email} />
          </div>
          {patient.notes && (
            <div className="pt-3 border-t border-border">
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-1.5">
                Observações
              </p>
              <p className="font-body text-[13px] text-foreground leading-relaxed">
                {patient.notes}
              </p>
            </div>
          )}
        </section>

        <section className="bg-card border border-border rounded-[18px] p-6 space-y-4">
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
