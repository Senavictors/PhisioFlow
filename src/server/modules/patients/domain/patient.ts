import type { PatientClassification } from '@/generated/prisma/client'

export type { PatientClassification }

type OptionalStringInput = string | null | undefined

export interface Patient {
  id: string
  userId: string
  name: string
  birthDate: Date | null
  phone: string | null
  email: string | null
  classification: PatientClassification
  notes: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ClinicalRecord {
  id: string
  patientId: string
  mainComplaint: string | null
  medicalHistory: string | null
  medications: string | null
  allergies: string | null
  createdAt: Date
  updatedAt: Date
}

export interface PatientWithRecord extends Patient {
  clinicalRecord: ClinicalRecord | null
}

export interface ClinicalRecordInput {
  mainComplaint?: OptionalStringInput
  medicalHistory?: OptionalStringInput
  medications?: OptionalStringInput
  allergies?: OptionalStringInput
}

function normalizeString(value: OptionalStringInput) {
  if (typeof value !== 'string') return null

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

export function toNullableText(value: OptionalStringInput) {
  return normalizeString(value)
}

export function toOptionalNullableText(value: OptionalStringInput) {
  if (value === undefined) return undefined
  return normalizeString(value)
}

export function toNullableEmail(value: OptionalStringInput) {
  const normalizedValue = normalizeString(value)
  return normalizedValue ? normalizedValue.toLowerCase() : null
}

export function toOptionalNullableEmail(value: OptionalStringInput) {
  if (value === undefined) return undefined
  return toNullableEmail(value)
}

export function hasClinicalRecordContent(record: ClinicalRecordInput) {
  return Object.values(record).some((value) => value !== null && value !== undefined)
}

export function normalizeClinicalRecordInput(record: ClinicalRecordInput): ClinicalRecordInput {
  return {
    mainComplaint: toOptionalNullableText(record.mainComplaint),
    medicalHistory: toOptionalNullableText(record.medicalHistory),
    medications: toOptionalNullableText(record.medications),
    allergies: toOptionalNullableText(record.allergies),
  }
}
