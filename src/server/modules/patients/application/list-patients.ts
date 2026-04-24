import type { ListPatientsDTO } from '../http/patient.dto'
import { listPatients } from '../infra/patient.repository'
import type { PatientClassification, TherapyArea } from '@/generated/prisma/client'

export async function listPatientsUseCase(userId: string, filters: ListPatientsDTO = {}) {
  return listPatients(userId, {
    area: filters.area as TherapyArea | undefined,
    classification: filters.classification as PatientClassification | undefined,
    search: filters.search,
  })
}
