import { TreatmentPlanNotFoundError } from '../domain/treatment-plan'
import { findTreatmentPlanById } from '../infra/treatment-plan.repository'

export { TreatmentPlanNotFoundError }

export async function getTreatmentPlanUseCase(id: string, userId: string) {
  const plan = await findTreatmentPlanById(id, userId)
  if (!plan) throw new TreatmentPlanNotFoundError()
  return plan
}
