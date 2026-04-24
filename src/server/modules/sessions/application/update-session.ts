import type { SessionStatus, SessionType } from '@/generated/prisma/client'
import type { UpdateSessionDTO } from '../http/session.dto'
import { normalizePartialSessionSoapInput, assertSessionSchedule } from '../domain/session'
import { findSessionById, updateSession } from '../infra/session.repository'
import { SessionNotFoundError } from './get-session'

export async function updateSessionUseCase(id: string, userId: string, dto: UpdateSessionDTO) {
  const existing = await findSessionById(id, userId)

  if (!existing) {
    throw new SessionNotFoundError('Sessão não encontrada')
  }

  const nextDate = dto.date ? new Date(dto.date) : existing.date
  const nextStatus = (dto.status ?? existing.status) as SessionStatus

  assertSessionSchedule(nextDate, nextStatus)

  return updateSession(id, {
    date: dto.date ? nextDate : undefined,
    duration: dto.duration,
    type: dto.type as SessionType | undefined,
    status: dto.status as SessionStatus | undefined,
    ...normalizePartialSessionSoapInput({
      subjective: dto.subjective,
      objective: dto.objective,
      assessment: dto.assessment,
      plan: dto.plan,
    }),
  })
}
