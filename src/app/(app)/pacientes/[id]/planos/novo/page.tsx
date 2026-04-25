import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getSession } from '@/lib/session'
import { TreatmentPlanForm } from '@/components/treatment-plans/TreatmentPlanForm'
import {
  getPatientUseCase,
  PatientNotFoundError,
} from '@/server/modules/patients/application/get-patient'

async function loadPatient(id: string, userId: string) {
  try {
    return await getPatientUseCase(id, userId)
  } catch (error) {
    if (error instanceof PatientNotFoundError) return null
    throw error
  }
}

export default async function NovoPlanoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  const patient = await loadPatient(id, session.userId!)

  if (!patient) {
    notFound()
  }

  return (
    <div className="max-w-[1040px] space-y-6 sm:space-y-8">
      <div>
        <Link
          href={`/pacientes/${id}`}
          className="mb-4 flex items-center gap-1.5 font-body text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Voltar para ficha clinica
        </Link>
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {patient.name}
        </p>
        <h1 className="font-display text-[30px] font-bold leading-tight text-foreground sm:text-[36px]">
          Novo plano de tratamento
        </h1>
        <p className="mt-1 font-body text-[14px] text-muted-foreground">
          Cadastre uma modalidade ativa para organizar atendimentos e evolucao.
        </p>
      </div>

      <TreatmentPlanForm patientId={id} />
    </div>
  )
}
