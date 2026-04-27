import { prisma } from '@/lib/prisma'
import type { PaymentStatus } from '@/generated/prisma/client'

export async function recomputeSessionPaymentStatus(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      expectedFee: true,
      treatmentPlanId: true,
      treatmentPlan: { select: { pricingModel: true } },
      payments: { where: { status: { not: 'REFUNDED' } } },
    },
  })

  if (!session) return

  const isPackage = session.treatmentPlan?.pricingModel === 'PACKAGE'
  if (isPackage) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { paymentStatus: null },
    })
    return
  }

  const expected = session.expectedFee ? Number(session.expectedFee) : 0
  const paid = session.payments.reduce((sum, p) => sum + Number(p.amount), 0)

  let next: PaymentStatus | null = null
  if (expected > 0) {
    if (paid >= expected) next = 'PAID'
    else if (paid > 0) next = 'PARTIAL'
    else next = 'PENDING'
  } else if (paid > 0) {
    next = 'PAID'
  }

  await prisma.session.update({
    where: { id: sessionId },
    data: { paymentStatus: next },
  })
}
