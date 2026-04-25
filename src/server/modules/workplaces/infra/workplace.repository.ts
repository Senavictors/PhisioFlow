import { prisma } from '@/lib/prisma'
import type { AttendanceType, Prisma, WorkplaceKind } from '@/generated/prisma/client'

export interface WorkplaceCreateInput {
  userId: string
  name: string
  kind: WorkplaceKind
  defaultAttendanceType: AttendanceType
  address?: string
  defaultSessionPrice?: number
  defaultCommissionPct?: number
  notes?: string
}

export interface WorkplaceUpdateInput {
  name?: string
  kind?: WorkplaceKind
  defaultAttendanceType?: AttendanceType
  address?: string | null
  defaultSessionPrice?: number | null
  defaultCommissionPct?: number | null
  notes?: string | null
}

export async function createWorkplace(data: WorkplaceCreateInput) {
  return prisma.workplace.create({ data })
}

export async function listWorkplaces(userId: string, includeArchived = false) {
  const where: Prisma.WorkplaceWhereInput = {
    userId,
    ...(includeArchived ? {} : { isActive: true }),
  }
  return prisma.workplace.findMany({
    where,
    orderBy: [{ isActive: 'desc' }, { createdAt: 'asc' }],
  })
}

export async function findWorkplaceById(id: string, userId: string) {
  return prisma.workplace.findFirst({ where: { id, userId } })
}

export async function updateWorkplace(id: string, data: WorkplaceUpdateInput) {
  return prisma.workplace.update({ where: { id }, data })
}

export async function archiveWorkplace(id: string) {
  return prisma.workplace.update({ where: { id }, data: { isActive: false } })
}

export async function findDefaultWorkplace(userId: string) {
  return prisma.workplace.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'asc' },
  })
}
