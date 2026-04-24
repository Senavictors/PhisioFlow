import { prisma } from '@/lib/prisma'
import type { PatientClassification, TherapyArea } from '@/generated/prisma/client'
import type { ClinicalRecordInput } from '../domain/patient'

export interface PatientCreateInput {
  userId: string
  name: string
  birthDate?: Date | null
  phone?: string | null
  email?: string | null
  classification: PatientClassification
  area: TherapyArea
  notes?: string | null
  clinicalRecord?: ClinicalRecordInput
}

export interface PatientUpdateInput {
  name?: string
  birthDate?: Date | null
  phone?: string | null
  email?: string | null
  classification?: PatientClassification
  area?: TherapyArea
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
    include: { clinicalRecord: true },
  })
}

export async function listPatients(userId: string, filters: ListFilters = {}) {
  return prisma.patient.findMany({
    where: {
      userId,
      isActive: true,
      ...(filters.area ? { area: filters.area } : {}),
      ...(filters.classification ? { classification: filters.classification } : {}),
      ...(filters.search ? { name: { contains: filters.search, mode: 'insensitive' } } : {}),
    },
    include: { clinicalRecord: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findPatientById(id: string, userId: string) {
  return prisma.patient.findFirst({
    where: { id, userId, isActive: true },
    include: { clinicalRecord: true },
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
    include: { clinicalRecord: true },
  })
}

export async function archivePatient(id: string) {
  return prisma.patient.update({
    where: { id },
    data: { isActive: false },
  })
}
