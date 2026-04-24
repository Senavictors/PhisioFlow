import type { SessionStatus, SessionType } from '@/generated/prisma/client'

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  AGENDADO: 'Agendado',
  REALIZADO: 'Realizado',
  CANCELADO: 'Cancelado',
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  PRESENTIAL: 'Atendimento presencial',
  HOME_CARE: 'Atendimento domiciliar',
}
