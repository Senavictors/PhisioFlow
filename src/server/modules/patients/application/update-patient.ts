import type { UpdatePatientDTO } from '../http/patient.dto'
import { parseDateOnly } from '@/lib/date'
import { PatientNotFoundError } from './get-patient'
import type { PatientClassification, TherapyArea } from '@/generated/prisma/client'
import {
  hasClinicalRecordContent,
  normalizeClinicalRecordInput,
  toOptionalNullableEmail,
  toOptionalNullableText,
} from '../domain/patient'
import { findPatientByEmail, findPatientById, updatePatient } from '../infra/patient.repository'
import { PatientEmailAlreadyExistsError } from './create-patient'

export async function updatePatientUseCase(id: string, userId: string, dto: UpdatePatientDTO) {
  const existing = await findPatientById(id, userId)
  if (!existing) throw new PatientNotFoundError('Paciente não encontrado')

  const {
    mainComplaint,
    medicalHistory,
    medications,
    allergies,
    birthDate,
    email,
    name,
    phone,
    notes,
    classification,
    area,
  } = dto

  const normalizedEmail = toOptionalNullableEmail(email)

  if (normalizedEmail && normalizedEmail !== existing.email) {
    const patientWithSameEmail = await findPatientByEmail(userId, normalizedEmail, id)

    if (patientWithSameEmail) {
      throw new PatientEmailAlreadyExistsError('Já existe um paciente ativo com este e-mail')
    }
  }

  const normalizedClinicalRecord = normalizeClinicalRecordInput({
    mainComplaint,
    medicalHistory,
    medications,
    allergies,
  })

  const hasClinicalUpdates = [mainComplaint, medicalHistory, medications, allergies].some(
    (value) => value !== undefined
  )

  return updatePatient(
    id,
    {
      name: name?.trim(),
      birthDate: birthDate === undefined ? undefined : birthDate ? parseDateOnly(birthDate) : null,
      phone: toOptionalNullableText(phone),
      email: normalizedEmail,
      classification: classification as PatientClassification | undefined,
      area: area as TherapyArea | undefined,
      notes: toOptionalNullableText(notes),
    },
    hasClinicalUpdates &&
      (existing.clinicalRecord || hasClinicalRecordContent(normalizedClinicalRecord))
      ? normalizedClinicalRecord
      : undefined
  )
}
