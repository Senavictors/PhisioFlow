import type { AttendanceType, SessionStatus } from '@/generated/prisma/client'
import { PatientNotFoundError } from '@/server/modules/patients/application/get-patient'
import { findPatientById } from '@/server/modules/patients/infra/patient.repository'
import { findDefaultWorkplace } from '@/server/modules/workplaces/infra/workplace.repository'
import { findTreatmentPlanById } from '@/server/modules/treatment-plans/infra/treatment-plan.repository'
import {
  TreatmentPlanInactiveError,
  TreatmentPlanNotFoundError,
} from '@/server/modules/treatment-plans/domain/treatment-plan'
import type { CreateSessionDTO } from '../http/session.dto'
import { createSession } from '../infra/session.repository'
import { assertSessionSchedule, normalizeSessionSoapInput } from '../domain/session'
import { syncSessionCalendarAfterMutation } from '@/server/modules/calendar/application/auto-sync-session-calendar'

export async function createSessionUseCase(userId: string, dto: CreateSessionDTO) {
  const patient = await findPatientById(dto.patientId, userId)

  if (!patient) {
    throw new PatientNotFoundError('Paciente não encontrado')
  }

  const date = new Date(dto.date)
  const status = dto.status as SessionStatus

  assertSessionSchedule(date, status)

  let workplaceId = dto.workplaceId ?? null
  let attendanceType = (dto.attendanceType as AttendanceType | undefined) ?? null
  let treatmentPlanId: string | null = null
  let expectedFee: number | null = null
  let isPackage = false

  if (dto.treatmentPlanId) {
    const plan = await findTreatmentPlanById(dto.treatmentPlanId, userId)
    if (!plan || plan.patientId !== dto.patientId) {
      throw new TreatmentPlanNotFoundError()
    }
    if (plan.status === 'COMPLETED' || plan.status === 'CANCELED') {
      throw new TreatmentPlanInactiveError()
    }
    treatmentPlanId = plan.id
    if (!workplaceId) workplaceId = plan.workplaceId
    if (!attendanceType) attendanceType = plan.attendanceType
    if (plan.pricingModel === 'PACKAGE') {
      isPackage = true
    } else if (plan.sessionPrice != null) {
      expectedFee = Number(plan.sessionPrice)
    }
  }

  if (!workplaceId) {
    const defaultWorkplace = await findDefaultWorkplace(userId)
    if (defaultWorkplace) {
      workplaceId = defaultWorkplace.id
      if (!attendanceType) attendanceType = defaultWorkplace.defaultAttendanceType
      if (!treatmentPlanId && expectedFee == null && defaultWorkplace.defaultSessionPrice != null) {
        expectedFee = Number(defaultWorkplace.defaultSessionPrice)
      }
    }
  }

  if (!workplaceId) {
    throw new Error('Nenhum local de trabalho disponível para criar a sessão')
  }

  if (!attendanceType) {
    attendanceType = 'CLINIC'
  }

  if (!isPackage && dto.expectedFee !== undefined) {
    expectedFee = dto.expectedFee
  }
  if (isPackage) expectedFee = null

  const paymentStatus = isPackage ? null : expectedFee && expectedFee > 0 ? 'PENDING' : null

  const createdSession = await createSession({
    userId,
    patientId: dto.patientId,
    treatmentPlanId,
    date,
    duration: dto.duration,
    status,
    workplaceId,
    attendanceType,
    expectedFee,
    paymentStatus,
    ...normalizeSessionSoapInput({
      subjective: dto.subjective,
      objective: dto.objective,
      assessment: dto.assessment,
      plan: dto.plan,
    }),
  })

  await syncSessionCalendarAfterMutation({
    userId,
    sessionId: createdSession.id,
    syncWithGoogleCalendar: dto.syncWithGoogleCalendar,
    status,
  })

  return createdSession
}
