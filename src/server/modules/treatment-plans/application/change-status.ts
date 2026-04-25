import type { PlanStatus } from '@/generated/prisma/client'
import { TreatmentPlanNotFoundError } from '../domain/treatment-plan'
import { findTreatmentPlanById, setTreatmentPlanStatus } from '../infra/treatment-plan.repository'

async function changeStatus(id: string, userId: string, status: PlanStatus) {
  const existing = await findTreatmentPlanById(id, userId)
  if (!existing) throw new TreatmentPlanNotFoundError()
  return setTreatmentPlanStatus(id, status)
}

export const pauseTreatmentPlanUseCase = (id: string, userId: string) =>
  changeStatus(id, userId, 'PAUSED')

export const resumeTreatmentPlanUseCase = (id: string, userId: string) =>
  changeStatus(id, userId, 'ACTIVE')

export const completeTreatmentPlanUseCase = (id: string, userId: string) =>
  changeStatus(id, userId, 'COMPLETED')

export const cancelTreatmentPlanUseCase = (id: string, userId: string) =>
  changeStatus(id, userId, 'CANCELED')
