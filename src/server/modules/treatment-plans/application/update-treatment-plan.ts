import type {
  AttendanceType,
  PlanStatus,
  PricingModel,
  Specialty,
  TherapyArea,
} from '@/generated/prisma/client'
import { findWorkplaceById } from '@/server/modules/workplaces/infra/workplace.repository'
import { TreatmentPlanNotFoundError, WorkplaceForPlanNotFoundError } from '../domain/treatment-plan'
import type { UpdateTreatmentPlanDTO } from '../http/treatment-plan.dto'
import { findTreatmentPlanById, updateTreatmentPlan } from '../infra/treatment-plan.repository'

function parseDate(value?: string) {
  if (value === undefined) return undefined
  if (value === '') return null
  return new Date(value)
}

export async function updateTreatmentPlanUseCase(
  id: string,
  userId: string,
  dto: UpdateTreatmentPlanDTO
) {
  const existing = await findTreatmentPlanById(id, userId)
  if (!existing) throw new TreatmentPlanNotFoundError()

  if (dto.workplaceId && dto.workplaceId !== existing.workplaceId) {
    const workplace = await findWorkplaceById(dto.workplaceId, userId)
    if (!workplace) throw new WorkplaceForPlanNotFoundError()
  }

  return updateTreatmentPlan(id, {
    workplaceId: dto.workplaceId,
    area: dto.area as TherapyArea | undefined,
    specialties: dto.specialties as Specialty[] | undefined,
    attendanceType: dto.attendanceType as AttendanceType | undefined,
    pricingModel: dto.pricingModel as PricingModel | undefined,
    status: dto.status as PlanStatus | undefined,
    sessionPrice: dto.sessionPrice,
    totalSessions: dto.totalSessions,
    packageAmount: dto.packageAmount,
    startsAt: parseDate(dto.startsAt),
    endsAt: parseDate(dto.endsAt),
    notes: dto.notes === undefined ? undefined : dto.notes?.trim() || null,
  })
}
