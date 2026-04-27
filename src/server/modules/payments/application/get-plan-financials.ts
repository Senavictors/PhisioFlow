import { prisma } from '@/lib/prisma'
import { TreatmentPlanNotFoundError } from '@/server/modules/treatment-plans/domain/treatment-plan'
import { findTreatmentPlanById } from '@/server/modules/treatment-plans/infra/treatment-plan.repository'
import { listPaymentsByPlan } from '../infra/payment.repository'

export interface PlanFinancials {
  totalDue: number
  totalPaid: number
  totalPending: number
  sessionsUsed: number
  sessionsRemaining: number | null
  payments: Awaited<ReturnType<typeof listPaymentsByPlan>>
}

export async function getTreatmentPlanFinancialsUseCase(
  planId: string,
  userId: string
): Promise<PlanFinancials> {
  const plan = await findTreatmentPlanById(planId, userId)
  if (!plan) throw new TreatmentPlanNotFoundError()

  const payments = await listPaymentsByPlan(userId, planId)

  const totalPaid = payments
    .filter((p) => p.status === 'PAID' || p.status === 'PARTIAL')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  let totalDue = 0
  let sessionsRemaining: number | null = null

  if (plan.pricingModel === 'PACKAGE') {
    totalDue = plan.packageAmount ? Number(plan.packageAmount) : 0
    if (plan.totalSessions) {
      sessionsRemaining = Math.max(0, plan.totalSessions - plan._count.sessions)
    }
  } else {
    const sessions = await prisma.session.findMany({
      where: { userId, treatmentPlanId: planId, isActive: true },
      select: { expectedFee: true },
    })
    totalDue = sessions.reduce((sum, s) => sum + (s.expectedFee ? Number(s.expectedFee) : 0), 0)
    if (plan.totalSessions) {
      sessionsRemaining = Math.max(0, plan.totalSessions - plan._count.sessions)
    }
  }

  const totalPending = Math.max(0, totalDue - totalPaid)

  return {
    totalDue,
    totalPaid,
    totalPending,
    sessionsUsed: plan._count.sessions,
    sessionsRemaining,
    payments,
  }
}
