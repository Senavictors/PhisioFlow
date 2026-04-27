import { prisma } from '@/lib/prisma'
import type { PaymentMethod, PaymentStatus, Prisma } from '@/generated/prisma/client'

const paymentInclude = {
  session: {
    select: {
      id: true,
      date: true,
      patient: { select: { id: true, name: true } },
    },
  },
  treatmentPlan: {
    select: {
      id: true,
      area: true,
      pricingModel: true,
      patient: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.PaymentInclude

export type PaymentWithRelations = Prisma.PaymentGetPayload<{
  include: typeof paymentInclude
}>

export interface PaymentCreateInput {
  userId: string
  treatmentPlanId?: string | null
  sessionId?: string | null
  amount: number
  method: PaymentMethod
  status?: PaymentStatus
  paidAt: Date
  dueAt?: Date | null
  notes?: string | null
}

export interface PaymentUpdateInput {
  amount?: number
  method?: PaymentMethod
  status?: PaymentStatus
  paidAt?: Date
  notes?: string | null
}

export async function createPayment(data: PaymentCreateInput) {
  return prisma.payment.create({
    data: {
      userId: data.userId,
      treatmentPlanId: data.treatmentPlanId ?? null,
      sessionId: data.sessionId ?? null,
      amount: data.amount,
      method: data.method,
      status: data.status ?? 'PAID',
      paidAt: data.paidAt,
      dueAt: data.dueAt ?? null,
      notes: data.notes ?? null,
    },
    include: paymentInclude,
  })
}

export async function findPaymentById(id: string, userId: string) {
  return prisma.payment.findFirst({
    where: { id, userId },
    include: paymentInclude,
  })
}

export async function updatePayment(id: string, data: PaymentUpdateInput) {
  return prisma.payment.update({
    where: { id },
    data,
    include: paymentInclude,
  })
}

export interface ListPaymentsFilters {
  from?: Date
  to?: Date
  patientId?: string
  planId?: string
  sessionId?: string
  status?: PaymentStatus
}

export async function listPayments(userId: string, filters: ListPaymentsFilters = {}) {
  const where: Prisma.PaymentWhereInput = {
    userId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.planId ? { treatmentPlanId: filters.planId } : {}),
    ...(filters.sessionId ? { sessionId: filters.sessionId } : {}),
    ...(filters.from || filters.to
      ? {
          paidAt: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lte: filters.to } : {}),
          },
        }
      : {}),
    ...(filters.patientId
      ? {
          OR: [
            { session: { patientId: filters.patientId } },
            { treatmentPlan: { patientId: filters.patientId } },
          ],
        }
      : {}),
  }

  return prisma.payment.findMany({
    where,
    include: paymentInclude,
    orderBy: { paidAt: 'desc' },
  })
}

export async function listPaymentsByPlan(userId: string, planId: string) {
  return prisma.payment.findMany({
    where: { userId, treatmentPlanId: planId },
    include: paymentInclude,
    orderBy: { paidAt: 'asc' },
  })
}

export async function listPaymentsBySession(userId: string, sessionId: string) {
  return prisma.payment.findMany({
    where: { userId, sessionId },
    orderBy: { paidAt: 'asc' },
  })
}
