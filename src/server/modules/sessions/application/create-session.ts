import type { SessionStatus, SessionType } from '@/generated/prisma/client'
import { PatientNotFoundError } from '@/server/modules/patients/application/get-patient'
import { findPatientById } from '@/server/modules/patients/infra/patient.repository'
import type { CreateSessionDTO } from '../http/session.dto'
import { createSession } from '../infra/session.repository'
import { assertSessionSchedule, normalizeSessionSoapInput } from '../domain/session'

export async function createSessionUseCase(userId: string, dto: CreateSessionDTO) {
  const patient = await findPatientById(dto.patientId, userId)

  if (!patient) {
    throw new PatientNotFoundError('Paciente não encontrado')
  }

  const date = new Date(dto.date)
  const status = dto.status as SessionStatus

  assertSessionSchedule(date, status)

  return createSession({
    userId,
    patientId: dto.patientId,
    date,
    duration: dto.duration,
    type: dto.type as SessionType,
    status,
    ...normalizeSessionSoapInput({
      subjective: dto.subjective,
      objective: dto.objective,
      assessment: dto.assessment,
      plan: dto.plan,
    }),
  })
}
