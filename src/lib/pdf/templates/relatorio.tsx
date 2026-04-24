import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { baseStyles } from '../styles'

const AREA_LABELS: Record<string, string> = {
  PILATES: 'Pilates',
  MOTOR: 'Motora',
  AESTHETIC: 'Estética',
  HOME_CARE: 'Domiciliar',
}

const STATUS_LABELS: Record<string, string> = {
  REALIZADO: 'Realizado',
  AGENDADO: 'Agendado',
  CANCELADO: 'Cancelado',
}

interface Session {
  date: Date | string
  status: string
  assessment: string | null
  plan: string | null
  subjective: string | null
  objective: string | null
}

interface RelatorioData {
  userName: string
  patient: {
    name: string
    birthDate?: Date | string | null
    area: string
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

export function RelatorioTemplate({ data }: { data: RelatorioData }) {
  const { userName, patient, period, sessions, emitedAt } = data
  const realizadas = sessions.filter((s) => s.status === 'REALIZADO')

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
            <Text style={baseStyles.docType}>Relatório de Progresso</Text>
            <Text style={baseStyles.docDate}>Emitido em {formatDate(emitedAt)}</Text>
          </View>
        </View>

        {/* Dados do Paciente */}
        <View style={baseStyles.section}>
          <Text style={baseStyles.sectionTitle}>Dados do Paciente</Text>
          <View style={baseStyles.row}>
            <Text style={baseStyles.label}>Nome:</Text>
            <Text style={baseStyles.value}>{patient.name}</Text>
          </View>
          {patient.birthDate && (
            <View style={baseStyles.row}>
              <Text style={baseStyles.label}>Data de Nascimento:</Text>
              <Text style={baseStyles.value}>{formatDate(patient.birthDate)}</Text>
            </View>
          )}
          <View style={baseStyles.row}>
            <Text style={baseStyles.label}>Área Terapêutica:</Text>
            <Text style={baseStyles.value}>{AREA_LABELS[patient.area] ?? patient.area}</Text>
          </View>
          {period && (
            <View style={baseStyles.row}>
              <Text style={baseStyles.label}>Período:</Text>
              <Text style={baseStyles.value}>{period}</Text>
            </View>
          )}
        </View>

        {/* Resumo */}
        <View style={baseStyles.section}>
          <Text style={baseStyles.sectionTitle}>Resumo do Período</Text>
          <View style={baseStyles.row}>
            <Text style={baseStyles.label}>Total de sessões:</Text>
            <Text style={baseStyles.value}>{sessions.length}</Text>
          </View>
          <View style={baseStyles.row}>
            <Text style={baseStyles.label}>Sessões realizadas:</Text>
            <Text style={baseStyles.value}>{realizadas.length}</Text>
          </View>
          <View style={baseStyles.row}>
            <Text style={baseStyles.label}>Canceladas:</Text>
            <Text style={baseStyles.value}>
              {sessions.filter((s) => s.status === 'CANCELADO').length}
            </Text>
          </View>
        </View>

        {/* Sessões */}
        {sessions.length > 0 && (
          <View style={baseStyles.section}>
            <Text style={baseStyles.sectionTitle}>Sessões no Período</Text>
            {sessions.map((s, i) => (
              <View key={i} style={baseStyles.sessionCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={baseStyles.sessionDate}>{formatDate(s.date)}</Text>
                  <Text style={{ fontSize: 8, color: '#6b6b68' }}>
                    {STATUS_LABELS[s.status] ?? s.status}
                  </Text>
                </View>
                {s.assessment && (
                  <>
                    <Text style={baseStyles.sessionFieldLabel}>Avaliação</Text>
                    <Text style={baseStyles.sessionFieldText}>{s.assessment}</Text>
                  </>
                )}
                {s.plan && (
                  <>
                    <Text style={baseStyles.sessionFieldLabel}>Plano</Text>
                    <Text style={baseStyles.sessionFieldText}>{s.plan}</Text>
                  </>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Assinatura */}
        <View style={baseStyles.footer}>
          <View style={baseStyles.footerDivider} />
          <View style={baseStyles.signatureBlock}>
            <Text style={baseStyles.signatureName}>{userName}</Text>
            <Text style={baseStyles.signatureRole}>Fisioterapeuta Responsável</Text>
            <Text style={[baseStyles.signatureRole, { marginTop: 2 }]}>
              {formatDate(emitedAt)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
