import { findPatientById } from '../infra/patient.repository'

export class PatientNotFoundError extends Error {}

export async function getPatientUseCase(id: string, userId: string) {
  const patient = await findPatientById(id, userId)
  if (!patient) throw new PatientNotFoundError('Paciente não encontrado')
  return patient
}
