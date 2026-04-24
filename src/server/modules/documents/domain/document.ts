import type { DocumentType } from '@/generated/prisma/client'

export class DocumentNotFoundError extends Error {}

export function buildDocumentTitle(type: DocumentType, patientName: string): string {
  const labels: Record<DocumentType, string> = {
    LAUDO_FISIOTERAPEUTICO: 'Laudo Fisioterapêutico',
    RELATORIO_PROGRESSO: 'Relatório de Progresso',
    DECLARACAO_COMPARECIMENTO: 'Declaração de Comparecimento',
  }
  return `${labels[type]} — ${patientName}`
}

export function parsePeriod(period: string): { from: Date; to: Date } | null {
  const match = period.match(/(\d{2})\/(\d{4})\s*[–\-]\s*(\d{2})\/(\d{4})/)
  if (!match) return null

  const [, fromMonth, fromYear, toMonth, toYear] = match
  const from = new Date(Date.UTC(parseInt(fromYear), parseInt(fromMonth) - 1, 1))
  const to = new Date(Date.UTC(parseInt(toYear), parseInt(toMonth), 0, 23, 59, 59))

  return { from, to }
}
