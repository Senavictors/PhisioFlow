import { prisma } from '@/lib/prisma'
import type {
  AttendanceType,
  PlanStatus,
  PricingModel,
  Prisma,
  Specialty,
  TherapyArea,
} from '@/generated/prisma/client'

const treatmentPlanInclude = {
  workplace: { select: { id: true, name: true } },
  patient: { select: { id: true, name: true } },
  _count: { select: { sessions: true } },
} satisfies Prisma.TreatmentPlanInclude

export type TreatmentPlanWithRelations = Prisma.TreatmentPlanGetPayload<{
  include: typeof treatmentPlanInclude
}>

export interface TreatmentPlanCreateInput {
  userId: string
  patientId: string
  workplaceId: string
  area: TherapyArea
  specialties: Specialty[]
  attendanceType: AttendanceType
  pricingModel: PricingModel
  sessionPrice?: number | null
  totalSessions?: number | null
  packageAmount?: number | null
  startsAt?: Date | null
  endsAt?: Date | null
  notes?: string | null
}

export interface TreatmentPlanUpdateInput {
  workplaceId?: string
  area?: TherapyArea
  specialties?: Specialty[]
  attendanceType?: AttendanceType
  pricingModel?: PricingModel
  status?: PlanStatus
  sessionPrice?: number | null
  totalSessions?: number | null
  packageAmount?: number | null
  startsAt?: Date | null
  endsAt?: Date | null
  notes?: string | null
}

export async function createTreatmentPlan(data: TreatmentPlanCreateInput) {
  return prisma.treatmentPlan.create({
    data,
    include: treatmentPlanInclude,
  })
}

export async function findTreatmentPlanById(id: string, userId: string) {
  return prisma.treatmentPlan.findFirst({
    where: { id, userId },
    include: treatmentPlanInclude,
  })
}

export async function listPatientTreatmentPlans(
  userId: string,
  patientId: string,
  status?: PlanStatus
) {
  return prisma.treatmentPlan.findMany({
    where: { userId, patientId, ...(status ? { status } : {}) },
    include: treatmentPlanInclude,
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })
}

export async function updateTreatmentPlan(id: string, data: TreatmentPlanUpdateInput) {
  return prisma.treatmentPlan.update({
    where: { id },
    data,
    include: treatmentPlanInclude,
  })
}

export async function setTreatmentPlanStatus(id: string, status: PlanStatus) {
  return prisma.treatmentPlan.update({
    where: { id },
    data: { status },
    include: treatmentPlanInclude,
  })
}
