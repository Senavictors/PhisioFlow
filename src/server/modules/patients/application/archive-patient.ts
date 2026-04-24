import { findPatientById, archivePatient } from '../infra/patient.repository'
import { PatientNotFoundError } from './get-patient'

export async function archivePatientUseCase(id: string, userId: string) {
  const existing = await findPatientById(id, userId)
  if (!existing) throw new PatientNotFoundError('Paciente não encontrado')
  return archivePatient(id)
}
