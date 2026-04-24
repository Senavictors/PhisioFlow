import { DocumentNotFoundError } from '../domain/document'
import { findDocumentById, archiveDocument } from '../infra/document.repository'

export async function deleteDocumentUseCase(id: string, userId: string) {
  const doc = await findDocumentById(id, userId)

  if (!doc) {
    throw new DocumentNotFoundError('Documento não encontrado')
  }

  return archiveDocument(id)
}
