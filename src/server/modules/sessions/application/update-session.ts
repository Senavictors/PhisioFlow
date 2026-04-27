import type { AttendanceType, SessionStatus } from '@/generated/prisma/client'
import { findTreatmentPlanById } from '@/server/modules/treatment-plans/infra/treatment-plan.repository'
import {
  TreatmentPlanInactiveError,
  TreatmentPlanNotFoundError,
} from '@/server/modules/treatment-plans/domain/treatment-plan'
import type { UpdateSessionDTO } from '../http/session.dto'
import { normalizePartialSessionSoapInput, assertSessionSchedule } from '../domain/session'
import { findSessionById, updateSession } from '../infra/session.repository'
import { SessionNotFoundError } from './get-session'
import { syncSessionCalendarAfterMutation } from '@/server/modules/calendar/application/auto-sync-session-calendar'

export async function updateSessionUseCase(id: string, userId: string, dto: UpdateSessionDTO) {
  const existing = await findSessionById(id, userId)

  if (!existing) {
    throw new SessionNotFoundError('Sessão não encontrada')
  }

  const nextDate = dto.date ? new Date(dto.date) : existing.date
  const nextStatus = (dto.status ?? existing.status) as SessionStatus

  assertSessionSchedule(nextDate, nextStatus)

  let treatmentPlanId: string | null | undefined
  let workplaceId = dto.workplaceId
  let attendanceType = dto.attendanceType as AttendanceType | undefined
  let expectedFeeUpdate: number | null | undefined
  let paymentStatusUpdate: 'PAID' | 'PENDING' | 'PARTIAL' | 'REFUNDED' | null | undefined
  let isPackage = false

  if (dto.treatmentPlanId === null || dto.treatmentPlanId === '') {
    treatmentPlanId = null
  } else if (typeof dto.treatmentPlanId === 'string') {
    const plan = await findTreatmentPlanById(dto.treatmentPlanId, userId)
    if (!plan || plan.patientId !== existing.patientId) {
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
      expectedFeeUpdate = null
      paymentStatusUpdate = null
    }
  }

  if (!isPackage && dto.expectedFee !== undefined) {
    expectedFeeUpdate = dto.expectedFee
  }

  const updatedSession = await updateSession(id, {
    treatmentPlanId,
    date: dto.date ? nextDate : undefined,
    duration: dto.duration,
    status: dto.status as SessionStatus | undefined,
    workplaceId,
    attendanceType,
    expectedFee: expectedFeeUpdate,
    paymentStatus: paymentStatusUpdate,
    ...normalizePartialSessionSoapInput({
      subjective: dto.subjective,
      objective: dto.objective,
      assessment: dto.assessment,
      plan: dto.plan,
    }),
  })

  if (expectedFeeUpdate !== undefined && !isPackage) {
    const { recomputeSessionPaymentStatus } =
      await import('@/server/modules/payments/application/recompute-session-payment-status')
    await recomputeSessionPaymentStatus(id)
  }

  await syncSessionCalendarAfterMutation({
    userId,
    sessionId: id,
    syncWithGoogleCalendar: dto.syncWithGoogleCalendar,
    status: nextStatus,
  })

  return updatedSession
}
