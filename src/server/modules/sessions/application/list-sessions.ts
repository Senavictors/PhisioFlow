import type { SessionStatus, SessionType, TherapyArea } from '@/generated/prisma/client'
import type { ListSessionsDTO } from '../http/session.dto'
import { listSessions } from '../infra/session.repository'

export interface ListSessionsUseCaseInput extends Partial<ListSessionsDTO> {
  order?: 'asc' | 'desc'
}

export async function listSessionsUseCase(userId: string, filters: ListSessionsUseCaseInput = {}) {
  return listSessions(userId, {
    patientId: filters.patientId,
    status: filters.status as SessionStatus | undefined,
    type: filters.type as SessionType | undefined,
    area: filters.area as TherapyArea | undefined,
    from: filters.from ? new Date(filters.from) : undefined,
    to: filters.to ? new Date(filters.to) : undefined,
    page: filters.page,
    limit: filters.limit,
    order: filters.order,
  })
}
