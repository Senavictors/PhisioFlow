import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getSession } from '@/lib/session'
import {
  TreatmentPlanForm,
  type TreatmentPlanFormInitialValues,
} from '@/components/treatment-plans/TreatmentPlanForm'
import {
  getPatientUseCase,
  PatientNotFoundError,
} from '@/server/modules/patients/application/get-patient'
import { getTreatmentPlanUseCase } from '@/server/modules/treatment-plans/application/get-treatment-plan'
import { TreatmentPlanNotFoundError } from '@/server/modules/treatment-plans/domain/treatment-plan'

async function loadPatient(id: string, userId: string) {
  try {
    return await getPatientUseCase(id, userId)
  } catch (error) {
    if (error instanceof PatientNotFoundError) return null
    throw error
  }
}

async function loadPlan(id: string, userId: string) {
  try {
    return await getTreatmentPlanUseCase(id, userId)
  } catch (error) {
    if (error instanceof TreatmentPlanNotFoundError) return null
    throw error
  }
}

export default async function EditarPlanoPage({
  params,
}: {
  params: Promise<{ id: string; planId: string }>
}) {
  const { id, planId } = await params
  const session = await getSession()
  const patient = await loadPatient(id, session.userId!)
  const plan = await loadPlan(planId, session.userId!)

  if (!patient || !plan || plan.patientId !== id) {
    notFound()
  }

  const initialValues: TreatmentPlanFormInitialValues = {
    id: plan.id,
    workplaceId: plan.workplaceId,
    area: plan.area,
    specialties: plan.specialties,
    attendanceType: plan.attendanceType,
    pricingModel: plan.pricingModel,
    sessionPrice: plan.sessionPrice?.toString() ?? null,
    totalSessions: plan.totalSessions,
    packageAmount: plan.packageAmount?.toString() ?? null,
    startsAt: plan.startsAt?.toISOString() ?? null,
    endsAt: plan.endsAt?.toISOString() ?? null,
    notes: plan.notes,
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
          Editar plano de tratamento
        </h1>
        <p className="mt-1 font-body text-[14px] text-muted-foreground">
          Atualize area, local, modalidade e condicoes do plano.
        </p>
      </div>

      <TreatmentPlanForm patientId={id} mode="edit" initialValues={initialValues} />
    </div>
  )
}
