import { prisma } from '@/lib/prisma'
import type { AttendanceType, Prisma, SessionStatus, TherapyArea } from '@/generated/prisma/client'

const sessionInclude = {
  patient: {
    select: {
      id: true,
      name: true,
      classification: true,
      homeCarePriority: true,
      address: true,
      neighborhood: true,
      city: true,
      email: true,
    },
  },
  workplace: {
    select: { id: true, name: true },
  },
  treatmentPlan: {
    select: {
      id: true,
      area: true,
      specialties: true,
      attendanceType: true,
      status: true,
      pricingModel: true,
    },
  },
  calendarEventLinks: {
    where: { provider: 'GOOGLE' },
    select: {
      id: true,
      provider: true,
      externalEventId: true,
      calendarId: true,
      status: true,
      errorMessage: true,
      lastSyncedAt: true,
    },
  },
} satisfies Prisma.SessionInclude

export type SessionWithPatient = Prisma.SessionGetPayload<{ include: typeof sessionInclude }>

export interface SessionCreateInput {
  userId: string
  patientId: string
  treatmentPlanId?: string | null
  date: Date
  duration: number
  status: SessionStatus
  workplaceId: string
  attendanceType: AttendanceType
  subjective?: string | null
  objective?: string | null
  assessment?: string | null
  plan?: string | null
}

export interface SessionUpdateInput {
  treatmentPlanId?: string | null
  date?: Date
  duration?: number
  status?: SessionStatus
  workplaceId?: string
  attendanceType?: AttendanceType
  subjective?: string | null
  objective?: string | null
  assessment?: string | null
  plan?: string | null
}

export interface ListSessionFilters {
  patientId?: string
  treatmentPlanId?: string
  status?: SessionStatus
  attendanceType?: AttendanceType
  area?: TherapyArea
  from?: Date
  to?: Date
  page?: number
  limit?: number
  order?: 'asc' | 'desc'
}

export async function createSession(data: SessionCreateInput) {
  return prisma.session.create({
    data,
    include: sessionInclude,
  })
}

export async function listSessions(userId: string, filters: ListSessionFilters = {}) {
  const where: Prisma.SessionWhereInput = {
    userId,
    isActive: true,
    ...(filters.patientId ? { patientId: filters.patientId } : {}),
    ...(filters.treatmentPlanId ? { treatmentPlanId: filters.treatmentPlanId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.attendanceType ? { attendanceType: filters.attendanceType } : {}),
    ...(filters.area ? { treatmentPlan: { area: filters.area } } : {}),
    ...(filters.from || filters.to
      ? {
          date: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lte: filters.to } : {}),
          },
        }
      : {}),
  }

  const page = filters.page ?? 1
  const limit = filters.limit ?? 20

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where,
      include: sessionInclude,
      orderBy: [{ date: filters.order ?? 'desc' }, { createdAt: filters.order ?? 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.session.count({ where }),
  ])

  return { sessions, total }
}

export async function findSessionById(id: string, userId: string) {
  return prisma.session.findFirst({
    where: {
      id,
      userId,
      isActive: true,
    },
    include: sessionInclude,
  })
}

export async function updateSession(id: string, data: SessionUpdateInput) {
  return prisma.session.update({
    where: { id },
    data,
    include: sessionInclude,
  })
}

export async function archiveSession(id: string) {
  return prisma.session.update({
    where: { id },
    data: { isActive: false },
  })
}
