import type { SessionStatus } from '@/generated/prisma/client'

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  AGENDADO: 'Agendado',
  REALIZADO: 'Realizado',
  CANCELADO: 'Cancelado',
}
