import type { PaymentStatus } from '@/generated/prisma/client'
import type { ListPaymentsDTO } from '../http/payment.dto'
import { listPayments } from '../infra/payment.repository'

export async function listPaymentsUseCase(userId: string, dto: ListPaymentsDTO = {}) {
  const payments = await listPayments(userId, {
    from: dto.from ? new Date(dto.from) : undefined,
    to: dto.to ? new Date(dto.to) : undefined,
    patientId: dto.patientId,
    planId: dto.planId,
    status: dto.status as PaymentStatus | undefined,
  })
  return { payments }
}
