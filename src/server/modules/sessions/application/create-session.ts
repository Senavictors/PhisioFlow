import type { AttendanceType, SessionStatus, SessionType } from '@/generated/prisma/client'
import { PatientNotFoundError } from '@/server/modules/patients/application/get-patient'
import { findPatientById } from '@/server/modules/patients/infra/patient.repository'
import { findDefaultWorkplace } from '@/server/modules/workplaces/infra/workplace.repository'
import type { CreateSessionDTO } from '../http/session.dto'
import { createSession } from '../infra/session.repository'
import { assertSessionSchedule, normalizeSessionSoapInput } from '../domain/session'
import { syncSessionCalendarAfterMutation } from '@/server/modules/calendar/application/auto-sync-session-calendar'

export async function createSessionUseCase(userId: string, dto: CreateSessionDTO) {
  const patient = await findPatientById(dto.patientId, userId)

  if (!patient) {
    throw new PatientNotFoundError('Paciente não encontrado')
  }

  const date = new Date(dto.date)
  const status = dto.status as SessionStatus

  assertSessionSchedule(date, status)

  let workplaceId = dto.workplaceId ?? null
  let attendanceType = (dto.attendanceType as AttendanceType | undefined) ?? null

  if (!workplaceId) {
    const defaultWorkplace = await findDefaultWorkplace(userId)
    if (defaultWorkplace) {
      workplaceId = defaultWorkplace.id
      if (!attendanceType) {
        attendanceType = defaultWorkplace.defaultAttendanceType
      }
    }
  }

  if (!attendanceType) {
    attendanceType = dto.type === 'HOME_CARE' ? 'HOME_CARE' : 'CLINIC'
  }

  const createdSession = await createSession({
    userId,
    patientId: dto.patientId,
    date,
    duration: dto.duration,
    type: dto.type as SessionType,
    status,
    workplaceId,
    attendanceType,
    ...normalizeSessionSoapInput({
      subjective: dto.subjective,
      objective: dto.objective,
      assessment: dto.assessment,
      plan: dto.plan,
    }),
  })

  await syncSessionCalendarAfterMutation({
    userId,
    sessionId: createdSession.id,
    syncWithGoogleCalendar: dto.syncWithGoogleCalendar,
    status,
  })

  return createdSession
}
