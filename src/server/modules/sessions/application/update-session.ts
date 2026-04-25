import type { AttendanceType, SessionStatus, SessionType } from '@/generated/prisma/client'
import type { UpdateSessionDTO } from '../http/session.dto'
import { normalizePartialSessionSoapInput, assertSessionSchedule } from '../domain/session'
import { findSessionById, updateSession } from '../infra/session.repository'
import { SessionNotFoundError } from './get-session'
import { syncSessionCalendarAfterMutation } from '@/server/modules/calendar/application/auto-sync-session-calendar'

export async function updateSessionUseCase(id: string, userId: string, dto: UpdateSessionDTO) {
  const existing = await findSessionById(id, userId)

  if (!existing) {
    throw new SessionNotFoundError('Sessão não encontrada')
  }

  const nextDate = dto.date ? new Date(dto.date) : existing.date
  const nextStatus = (dto.status ?? existing.status) as SessionStatus

  assertSessionSchedule(nextDate, nextStatus)

  const updatedSession = await updateSession(id, {
    date: dto.date ? nextDate : undefined,
    duration: dto.duration,
    type: dto.type as SessionType | undefined,
    status: dto.status as SessionStatus | undefined,
    workplaceId: dto.workplaceId,
    attendanceType: dto.attendanceType as AttendanceType | undefined,
    ...normalizePartialSessionSoapInput({
      subjective: dto.subjective,
      objective: dto.objective,
      assessment: dto.assessment,
      plan: dto.plan,
    }),
  })

  await syncSessionCalendarAfterMutation({
    userId,
    sessionId: id,
    syncWithGoogleCalendar: dto.syncWithGoogleCalendar,
    status: nextStatus,
  })

  return updatedSession
}
