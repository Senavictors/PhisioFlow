import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { baseStyles } from '../styles'

interface Session {
  date: Date | string
}

interface DeclaracaoData {
  userName: string
  patient: {
    name: string
    birthDate?: Date | string | null
    phone?: string | null
  }
  period?: string
  sessions: Session[]
  emitedAt: Date
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateList(sessions: Session[]) {
  if (sessions.length === 0) return 'nenhuma sessão registrada'
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const dates = sorted.map((s) => formatDate(s.date))
  if (dates.length === 1) return dates[0]
  return dates.slice(0, -1).join(', ') + ' e ' + dates[dates.length - 1]
}

export function DeclaracaoTemplate({ data }: { data: DeclaracaoData }) {
  const { userName, patient, period, sessions, emitedAt } = data

  const periodText = period ? ` no período de ${period}` : ''
  const dateList = formatDateList(sessions)

  return (
    <Document>
      <Page size="A4" style={baseStyles.page}>
        {/* Header */}
        <View style={baseStyles.header}>
          <View>
            <Text style={baseStyles.brandName}>PhysioFlow</Text>
            <Text style={baseStyles.brandTagline}>Gestão Clínica para Fisioterapeutas</Text>
          </View>
          <View style={baseStyles.headerRight}>
            <Text style={baseStyles.docType}>Declaração de Comparecimento</Text>
            <Text style={baseStyles.docDate}>Emitido em {formatDate(emitedAt)}</Text>
          </View>
        </View>

        {/* Corpo */}
        <View style={{ marginTop: 40, marginBottom: 40 }}>
          <Text style={baseStyles.declarationText}>
            Declaro, para os devidos fins, que{' '}
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{patient.name}</Text>
            {patient.birthDate ? `, nascido(a) em ${formatDate(patient.birthDate)},` : ','}{' '}
            compareceu para atendimento fisioterapêutico{periodText} nas seguintes datas:{' '}
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{dateList}</Text>.
          </Text>

          {sessions.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={baseStyles.declarationText}>
                Total de sessões{periodText}: {sessions.length} sessão
                {sessions.length !== 1 ? 'ões' : ''} registrada
                {sessions.length !== 1 ? 's' : ''}.
              </Text>
            </View>
          )}
        </View>

        {/* Local e Data */}
        <View style={{ marginTop: 32 }}>
          <Text style={{ fontSize: 10, color: '#6b6b68' }}>Emitido em {formatDate(emitedAt)}.</Text>
        </View>

        {/* Assinatura */}
        <View style={baseStyles.footer}>
          <View style={baseStyles.footerDivider} />
          <View style={baseStyles.signatureBlock}>
            <Text style={baseStyles.signatureName}>{userName}</Text>
            <Text style={baseStyles.signatureRole}>Fisioterapeuta Responsável</Text>
            <Text style={[baseStyles.signatureRole, { marginTop: 2 }]}>{formatDate(emitedAt)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
