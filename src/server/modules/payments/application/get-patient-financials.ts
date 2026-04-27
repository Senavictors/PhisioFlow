import { prisma } from '@/lib/prisma'
import { listPayments } from '../infra/payment.repository'

export interface PatientFinancials {
  totalPaid: number
  totalPending: number
  payments: Awaited<ReturnType<typeof listPayments>>
}

export async function getPatientFinancialsUseCase(
  patientId: string,
  userId: string
): Promise<PatientFinancials> {
  const payments = await listPayments(userId, { patientId })

  const totalPaid = payments
    .filter((p) => p.status === 'PAID' || p.status === 'PARTIAL')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const pendingSessions = await prisma.session.findMany({
    where: {
      userId,
      patientId,
      isActive: true,
      paymentStatus: { in: ['PENDING', 'PARTIAL'] },
    },
    select: { expectedFee: true, paymentStatus: true, payments: true },
  })

  let totalPending = 0
  for (const s of pendingSessions) {
    const expected = s.expectedFee ? Number(s.expectedFee) : 0
    const paid = s.payments
      .filter((p) => p.status !== 'REFUNDED')
      .reduce((sum, p) => sum + Number(p.amount), 0)
    totalPending += Math.max(0, expected - paid)
  }

  return { totalPaid, totalPending, payments }
}
