import type {
  AttendanceType,
  PricingModel,
  Specialty,
  TherapyArea,
} from '@/generated/prisma/client'
import { PatientNotFoundError } from '@/server/modules/patients/application/get-patient'
import { findPatientById } from '@/server/modules/patients/infra/patient.repository'
import { findWorkplaceById } from '@/server/modules/workplaces/infra/workplace.repository'
import { WorkplaceForPlanNotFoundError } from '../domain/treatment-plan'
import type { CreateTreatmentPlanDTO } from '../http/treatment-plan.dto'
import { createTreatmentPlan } from '../infra/treatment-plan.repository'

function parseDate(value?: string) {
  if (!value) return null
  return new Date(value)
}

export async function createTreatmentPlanUseCase(
  userId: string,
  patientId: string,
  dto: CreateTreatmentPlanDTO
) {
  const patient = await findPatientById(patientId, userId)
  if (!patient) {
    throw new PatientNotFoundError('Paciente não encontrado')
  }

  const workplace = await findWorkplaceById(dto.workplaceId, userId)
  if (!workplace) {
    throw new WorkplaceForPlanNotFoundError()
  }

  return createTreatmentPlan({
    userId,
    patientId,
    workplaceId: dto.workplaceId,
    area: dto.area as TherapyArea,
    specialties: dto.specialties as Specialty[],
    attendanceType: dto.attendanceType as AttendanceType,
    pricingModel: dto.pricingModel as PricingModel,
    sessionPrice: dto.sessionPrice ?? null,
    totalSessions: dto.totalSessions ?? null,
    packageAmount: dto.packageAmount ?? null,
    startsAt: parseDate(dto.startsAt),
    endsAt: parseDate(dto.endsAt),
    notes: dto.notes?.trim() || null,
  })
}
