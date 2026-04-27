import { findSessionById } from '@/server/modules/sessions/infra/session.repository'
import { findTreatmentPlanById } from '@/server/modules/treatment-plans/infra/treatment-plan.repository'
import { TreatmentPlanNotFoundError } from '@/server/modules/treatment-plans/domain/treatment-plan'
import { SessionNotFoundError } from '@/server/modules/sessions/application/get-session'
import { InvalidPaymentTargetError, SessionCoveredByPackageError } from '../domain/payment'
import type { RegisterPaymentDTO } from '../http/payment.dto'
import { createPayment } from '../infra/payment.repository'
import { recomputeSessionPaymentStatus } from './recompute-session-payment-status'
import type { PaymentMethod } from '@/generated/prisma/client'

export interface RegisterPaymentInput {
  userId: string
  dto: RegisterPaymentDTO
  treatmentPlanId?: string
  sessionId?: string
}

export async function registerPaymentUseCase(input: RegisterPaymentInput) {
  const { userId, dto, treatmentPlanId, sessionId } = input

  if (Boolean(treatmentPlanId) === Boolean(sessionId)) {
    throw new InvalidPaymentTargetError()
  }

  if (treatmentPlanId) {
    const plan = await findTreatmentPlanById(treatmentPlanId, userId)
    if (!plan) throw new TreatmentPlanNotFoundError()
  }

  if (sessionId) {
    const session = await findSessionById(sessionId, userId)
    if (!session) throw new SessionNotFoundError('Sessão não encontrada')
    if (session.treatmentPlan?.pricingModel === 'PACKAGE') {
      throw new SessionCoveredByPackageError()
    }
  }

  const payment = await createPayment({
    userId,
    treatmentPlanId: treatmentPlanId ?? null,
    sessionId: sessionId ?? null,
    amount: dto.amount,
    method: dto.method as PaymentMethod,
    paidAt: new Date(dto.paidAt),
    notes: dto.notes?.trim() || null,
    status: 'PAID',
  })

  if (sessionId) {
    await recomputeSessionPaymentStatus(sessionId)
  }

  return payment
}
