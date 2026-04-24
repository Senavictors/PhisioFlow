import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { baseStyles, COLORS } from '../styles'

const AREA_LABELS: Record<string, string> = {
  PILATES: 'Pilates',
  MOTOR: 'Motora',
  AESTHETIC: 'Estética',
  HOME_CARE: 'Domiciliar',
}

const CLASS_LABELS: Record<string, string> = {
  ELDERLY: 'Idoso',
  PCD: 'PCD',
  POST_ACCIDENT: 'Pós-Acidente',
  STANDARD: 'Padrão',
}

interface Session {
  date: Date | string
  assessment: string | null
  plan: string | null
  subjective: string | null
  objective: string | null
}

interface LaudoData {
  userName: string
  patient: {
    name: string
    birthDate?: Date | string | null
    area: string
    classification: string
    phone?: string | null
    clinicalRecord?: {
      mainComplaint?: string | null
      medicalHistory?: string | null
    } | null
  }
  sessions: Session[]
  emitedAt: Date
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function LaudoTemplate({ data }: { data: LaudoData }) {
  const { userName, patient, sessions, emitedAt } = data

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
            <Text style={baseStyles.docType}>Laudo Fisioterapêutico</Text>
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
          <View style={baseStyles.row}>
            <Text style={baseStyles.label}>Classificação:</Text>
            <Text style={baseStyles.value}>
              {CLASS_LABELS[patient.classification] ?? patient.classification}
            </Text>
          </View>
          {patient.phone && (
            <View style={baseStyles.row}>
              <Text style={baseStyles.label}>Telefone:</Text>
              <Text style={baseStyles.value}>{patient.phone}</Text>
            </View>
          )}
        </View>

        {/* Diagnóstico */}
        {(patient.clinicalRecord?.mainComplaint || patient.clinicalRecord?.medicalHistory) && (
          <View style={baseStyles.section}>
            <Text style={baseStyles.sectionTitle}>Diagnóstico Clínico</Text>
            {patient.clinicalRecord.mainComplaint && (
              <View style={{ marginBottom: 8 }}>
                <Text
                  style={[
                    baseStyles.label,
                    { marginBottom: 3, color: COLORS.muted, width: '100%' },
                  ]}
                >
                  Queixa Principal:
                </Text>
                <Text style={baseStyles.bodyText}>{patient.clinicalRecord.mainComplaint}</Text>
              </View>
            )}
            {patient.clinicalRecord.medicalHistory && (
              <View>
                <Text
                  style={[
                    baseStyles.label,
                    { marginBottom: 3, color: COLORS.muted, width: '100%' },
                  ]}
                >
                  Histórico Médico:
                </Text>
                <Text style={baseStyles.bodyText}>{patient.clinicalRecord.medicalHistory}</Text>
              </View>
            )}
          </View>
        )}

        {/* Evolução */}
        {sessions.length > 0 && (
          <View style={baseStyles.section}>
            <Text style={baseStyles.sectionTitle}>Evolução Clínica ({sessions.length} sessões)</Text>
            {sessions.map((s, i) => (
              <View key={i} style={baseStyles.sessionCard}>
                <Text style={baseStyles.sessionDate}>Sessão — {formatDate(s.date)}</Text>
                {s.subjective && (
                  <>
                    <Text style={baseStyles.sessionFieldLabel}>Subjetivo</Text>
                    <Text style={baseStyles.sessionFieldText}>{s.subjective}</Text>
                  </>
                )}
                {s.objective && (
                  <>
                    <Text style={baseStyles.sessionFieldLabel}>Objetivo</Text>
                    <Text style={baseStyles.sessionFieldText}>{s.objective}</Text>
                  </>
                )}
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
