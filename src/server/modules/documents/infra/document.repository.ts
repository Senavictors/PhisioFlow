import { prisma } from '@/lib/prisma'
import type { DocumentType, Prisma } from '@/generated/prisma/client'

const documentInclude = {
  patient: {
    select: {
      id: true,
      name: true,
      classification: true,
      treatmentPlans: {
        where: { status: { in: ['ACTIVE', 'PAUSED'] } },
        select: { id: true, area: true, specialties: true, status: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  },
} satisfies Prisma.DocumentInclude

export type DocumentWithPatient = Prisma.DocumentGetPayload<{ include: typeof documentInclude }>

export interface DocumentCreateInput {
  userId: string
  patientId: string
  type: DocumentType
  title: string
  period?: string
}

export interface ListDocumentFilters {
  patientId?: string
  type?: DocumentType
  page?: number
  limit?: number
}

export async function createDocument(data: DocumentCreateInput) {
  return prisma.document.create({
    data,
    include: documentInclude,
  })
}

export async function listDocuments(userId: string, filters: ListDocumentFilters = {}) {
  const where: Prisma.DocumentWhereInput = {
    userId,
    isActive: true,
    ...(filters.patientId ? { patientId: filters.patientId } : {}),
    ...(filters.type ? { type: filters.type } : {}),
  }

  const page = filters.page ?? 1
  const limit = filters.limit ?? 20

  const [documents, total] = await prisma.$transaction([
    prisma.document.findMany({
      where,
      include: documentInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.document.count({ where }),
  ])

  return { documents, total }
}

export async function findDocumentById(id: string, userId: string) {
  return prisma.document.findFirst({
    where: { id, userId, isActive: true },
    include: documentInclude,
  })
}

export async function findDocumentForDownload(
  id: string,
  userId: string,
  sessionFilters?: { from?: Date; to?: Date }
) {
  return prisma.document.findFirst({
    where: { id, userId, isActive: true },
    include: {
      patient: {
        include: {
          clinicalRecord: true,
          treatmentPlans: {
            where: { status: { in: ['ACTIVE', 'PAUSED'] } },
            select: { id: true, area: true, specialties: true, status: true },
            orderBy: { createdAt: 'desc' },
          },
          sessions: {
            where: {
              isActive: true,
              status: 'REALIZADO',
              ...(sessionFilters?.from || sessionFilters?.to
                ? {
                    date: {
                      ...(sessionFilters.from ? { gte: sessionFilters.from } : {}),
                      ...(sessionFilters.to ? { lte: sessionFilters.to } : {}),
                    },
                  }
                : {}),
            },
            include: {
              treatmentPlan: { select: { id: true, area: true, specialties: true } },
            },
            orderBy: { date: 'desc' },
            take: 20,
          },
        },
      },
      user: {
        select: { name: true, email: true },
      },
    },
  })
}

export async function archiveDocument(id: string) {
  return prisma.document.update({
    where: { id },
    data: { isActive: false },
  })
}
