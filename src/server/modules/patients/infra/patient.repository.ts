import { prisma } from '@/lib/prisma'
import type { PatientClassification, Prisma, TherapyArea } from '@/generated/prisma/client'
import type { ClinicalRecordInput } from '../domain/patient'

const patientInclude = {
  clinicalRecord: true,
  treatmentPlans: {
    where: { status: { in: ['ACTIVE', 'PAUSED'] } },
    select: {
      id: true,
      area: true,
      specialties: true,
      attendanceType: true,
      pricingModel: true,
      status: true,
      totalSessions: true,
      packageAmount: true,
      sessionPrice: true,
      workplace: { select: { id: true, name: true } },
      _count: { select: { sessions: true } },
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  },
} satisfies Prisma.PatientInclude

export interface PatientCreateInput {
  userId: string
  name: string
  birthDate?: Date | null
  phone?: string | null
  email?: string | null
  classification: PatientClassification
  notes?: string | null
  clinicalRecord?: ClinicalRecordInput
}

export interface PatientUpdateInput {
  name?: string
  birthDate?: Date | null
  phone?: string | null
  email?: string | null
  classification?: PatientClassification
  notes?: string | null
}

export type ClinicalRecordUpdateInput = ClinicalRecordInput

export interface ListFilters {
  area?: TherapyArea
  classification?: PatientClassification
  search?: string
}

export async function createPatient(data: PatientCreateInput) {
  const { clinicalRecord, ...patientData } = data

  return prisma.patient.create({
    data: {
      ...patientData,
      ...(clinicalRecord ? { clinicalRecord: { create: clinicalRecord } } : {}),
    },
    include: patientInclude,
  })
}

export async function listPatients(userId: string, filters: ListFilters = {}) {
  return prisma.patient.findMany({
    where: {
      userId,
      isActive: true,
      ...(filters.classification ? { classification: filters.classification } : {}),
      ...(filters.search ? { name: { contains: filters.search, mode: 'insensitive' } } : {}),
      ...(filters.area
        ? { treatmentPlans: { some: { area: filters.area, status: 'ACTIVE' } } }
        : {}),
    },
    include: patientInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export async function findPatientById(id: string, userId: string) {
  return prisma.patient.findFirst({
    where: { id, userId, isActive: true },
    include: patientInclude,
  })
}

export async function findPatientByEmail(userId: string, email: string, excludeId?: string) {
  return prisma.patient.findFirst({
    where: {
      userId,
      email,
      isActive: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  })
}

export async function updatePatient(
  id: string,
  data: PatientUpdateInput,
  clinicalRecord?: ClinicalRecordUpdateInput
) {
  return prisma.patient.update({
    where: { id },
    data: {
      ...data,
      ...(clinicalRecord
        ? {
            clinicalRecord: {
              upsert: {
                create: clinicalRecord,
                update: clinicalRecord,
              },
            },
          }
        : {}),
    },
    include: patientInclude,
  })
}

export async function archivePatient(id: string) {
  return prisma.patient.update({
    where: { id },
    data: { isActive: false },
  })
}
