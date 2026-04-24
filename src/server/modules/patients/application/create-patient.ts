import type { CreatePatientDTO } from '../http/patient.dto'
import { parseDateOnly } from '@/lib/date'
import type { PatientClassification, TherapyArea } from '@/generated/prisma/client'
import {
  hasClinicalRecordContent,
  normalizeClinicalRecordInput,
  toNullableEmail,
  toNullableText,
} from '../domain/patient'
import { createPatient, findPatientByEmail } from '../infra/patient.repository'

export class PatientEmailAlreadyExistsError extends Error {}

export async function createPatientUseCase(userId: string, dto: CreatePatientDTO) {
  const normalizedEmail = toNullableEmail(dto.email)

  if (normalizedEmail) {
    const existingPatient = await findPatientByEmail(userId, normalizedEmail)

    if (existingPatient) {
      throw new PatientEmailAlreadyExistsError('Já existe um paciente ativo com este e-mail')
    }
  }

  const clinicalRecord = normalizeClinicalRecordInput({
    mainComplaint: dto.mainComplaint,
    medicalHistory: dto.medicalHistory,
    medications: dto.medications,
    allergies: dto.allergies,
  })

  return createPatient({
    userId,
    name: dto.name,
    birthDate: dto.birthDate ? parseDateOnly(dto.birthDate) : null,
    phone: toNullableText(dto.phone),
    email: normalizedEmail,
    classification: dto.classification as PatientClassification,
    area: dto.area as TherapyArea,
    notes: toNullableText(dto.notes),
    clinicalRecord: hasClinicalRecordContent(clinicalRecord) ? clinicalRecord : undefined,
  })
}
