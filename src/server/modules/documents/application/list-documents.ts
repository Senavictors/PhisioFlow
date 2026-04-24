import type { DocumentType } from '@/generated/prisma/client'
import { listDocuments } from '../infra/document.repository'
import type { ListDocumentsDTO } from '../http/document.dto'

export async function listDocumentsUseCase(userId: string, dto: ListDocumentsDTO) {
  return listDocuments(userId, {
    patientId: dto.patientId,
    type: dto.type as DocumentType | undefined,
    page: dto.page,
    limit: dto.limit,
  })
}
