import type { SessionStatus } from '@/generated/prisma/client'

export interface SessionSoapInput {
  subjective?: string | null
  objective?: string | null
  assessment?: string | null
  plan?: string | null
}

export class InvalidSessionScheduleError extends Error {}

function normalizeText(value?: string | null) {
  if (value === null || value === undefined) return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function toNullableSessionText(value?: string | null) {
  return normalizeText(value)
}

export function toOptionalSessionText(value?: string | null) {
  if (value === undefined) return undefined
  return normalizeText(value)
}

export function normalizeSessionSoapInput(input: SessionSoapInput) {
  return {
    subjective: toNullableSessionText(input.subjective),
    objective: toNullableSessionText(input.objective),
    assessment: toNullableSessionText(input.assessment),
    plan: toNullableSessionText(input.plan),
  }
}

export function normalizePartialSessionSoapInput(input: SessionSoapInput) {
  return {
    subjective: toOptionalSessionText(input.subjective),
    objective: toOptionalSessionText(input.objective),
    assessment: toOptionalSessionText(input.assessment),
    plan: toOptionalSessionText(input.plan),
  }
}

export function assertSessionSchedule(date: Date, status: SessionStatus) {
  const oneMinuteAgo = Date.now() - 60_000

  if (status === 'AGENDADO' && date.getTime() < oneMinuteAgo) {
    throw new InvalidSessionScheduleError('Sessões agendadas não podem estar no passado')
  }
}
