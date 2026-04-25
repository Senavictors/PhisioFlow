import type { PlanStatus } from '@/generated/prisma/client'
import type { ListTreatmentPlansDTO } from '../http/treatment-plan.dto'
import { listPatientTreatmentPlans } from '../infra/treatment-plan.repository'

export async function listPatientTreatmentPlansUseCase(
  userId: string,
  patientId: string,
  filters: ListTreatmentPlansDTO = {}
) {
  const plans = await listPatientTreatmentPlans(
    userId,
    patientId,
    filters.status as PlanStatus | undefined
  )
  return { plans }
}
