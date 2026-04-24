import type { DocumentType } from '@/generated/prisma/client'
import { PatientNotFoundError } from '@/server/modules/patients/application/get-patient'
import { findPatientById } from '@/server/modules/patients/infra/patient.repository'
import { buildDocumentTitle } from '../domain/document'
import { createDocument } from '../infra/document.repository'
import type { CreateDocumentDTO } from '../http/document.dto'

export async function createDocumentUseCase(userId: string, dto: CreateDocumentDTO) {
  const patient = await findPatientById(dto.patientId, userId)

  if (!patient) {
    throw new PatientNotFoundError('Paciente não encontrado')
  }

  const type = dto.type as DocumentType
  const title = buildDocumentTitle(type, patient.name)

  return createDocument({
    userId,
    patientId: dto.patientId,
    type,
    title,
    period: dto.period ?? undefined,
  })
}
