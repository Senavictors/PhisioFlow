import 'server-only'
import React from 'react'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { LaudoTemplate } from './templates/laudo'
import { RelatorioTemplate } from './templates/relatorio'
import { DeclaracaoTemplate } from './templates/declaracao'

interface Session {
  date: Date | string
  status: string
  assessment: string | null
  plan: string | null
  subjective: string | null
  objective: string | null
}

interface Patient {
  name: string
  birthDate?: Date | string | null
  phone?: string | null
  area: string
  classification: string
  clinicalRecord?: {
    mainComplaint?: string | null
    medicalHistory?: string | null
  } | null
}

interface DocumentRenderInput {
  type: string
  userName: string
  patient: Patient
  period?: string
  sessions: Session[]
}

export async function renderDocumentPDF(input: DocumentRenderInput): Promise<Buffer> {
  const emitedAt = new Date()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let element: React.ReactElement<any>

  switch (input.type) {
    case 'LAUDO_FISIOTERAPEUTICO':
      element = React.createElement(LaudoTemplate, {
        data: {
          userName: input.userName,
          patient: input.patient,
          sessions: input.sessions,
          emitedAt,
        },
      })
      break

    case 'RELATORIO_PROGRESSO':
      element = React.createElement(RelatorioTemplate, {
        data: {
          userName: input.userName,
          patient: input.patient,
          period: input.period,
          sessions: input.sessions,
          emitedAt,
        },
      })
      break

    case 'DECLARACAO_COMPARECIMENTO':
      element = React.createElement(DeclaracaoTemplate, {
        data: {
          userName: input.userName,
          patient: input.patient,
          period: input.period,
          sessions: input.sessions,
          emitedAt,
        },
      })
      break

    default:
      throw new Error(`Tipo de documento inválido: ${input.type}`)
  }

  return renderToBuffer(element as React.ReactElement<DocumentProps>) as Promise<Buffer>
}
