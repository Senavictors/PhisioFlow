import { DocumentNotFoundError, parsePeriod } from '../domain/document'
import { findDocumentForDownload } from '../infra/document.repository'

export async function getDocumentForDownloadUseCase(id: string, userId: string) {
  const doc = await findDocumentForDownload(id, userId)

  if (!doc) {
    throw new DocumentNotFoundError('Documento não encontrado')
  }

  if (doc.period) {
    const range = parsePeriod(doc.period)
    if (range) {
      return findDocumentForDownload(id, userId, range)
    }
  }

  return doc
}
