import type { PaymentMethod, PaymentStatus } from '@/generated/prisma/client'
import { PaymentNotFoundError } from '../domain/payment'
import type { UpdatePaymentDTO } from '../http/payment.dto'
import { findPaymentById, updatePayment } from '../infra/payment.repository'
import { recomputeSessionPaymentStatus } from './recompute-session-payment-status'

export async function updatePaymentUseCase(id: string, userId: string, dto: UpdatePaymentDTO) {
  const existing = await findPaymentById(id, userId)
  if (!existing) throw new PaymentNotFoundError()

  const updated = await updatePayment(id, {
    amount: dto.amount,
    method: dto.method as PaymentMethod | undefined,
    status: dto.status as PaymentStatus | undefined,
    paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
    notes: dto.notes !== undefined ? dto.notes?.trim() || null : undefined,
  })

  if (existing.sessionId) {
    await recomputeSessionPaymentStatus(existing.sessionId)
  }

  return updated
}

export async function voidPaymentUseCase(id: string, userId: string) {
  const existing = await findPaymentById(id, userId)
  if (!existing) throw new PaymentNotFoundError()

  const updated = await updatePayment(id, { status: 'REFUNDED' })

  if (existing.sessionId) {
    await recomputeSessionPaymentStatus(existing.sessionId)
  }

  return updated
}
