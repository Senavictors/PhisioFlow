import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PatientNotFoundError } from '@/server/modules/patients/application/get-patient'
import { findPatientById } from '@/server/modules/patients/infra/patient.repository'
import { InvalidSessionScheduleError } from '../domain/session'
import { createSessionUseCase } from './create-session'
import { createSession } from '../infra/session.repository'
import { syncSessionCalendarAfterMutation } from '@/server/modules/calendar/application/auto-sync-session-calendar'

vi.mock('@/server/modules/patients/infra/patient.repository')
vi.mock('../infra/session.repository')
vi.mock('@/server/modules/calendar/application/auto-sync-session-calendar')

const mockFindPatientById = vi.mocked(findPatientById)
const mockCreateSession = vi.mocked(createSession)
const mockSyncSessionCalendarAfterMutation = vi.mocked(syncSessionCalendarAfterMutation)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createSessionUseCase', () => {
  it('cria uma sessão válida para um paciente do usuário', async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    mockFindPatientById.mockResolvedValue({ id: 'patient-1' } as never)
    mockCreateSession.mockResolvedValue({ id: 'session-1' } as never)

    await createSessionUseCase('user-1', {
      patientId: 'patient-1',
      date: futureDate,
      duration: 50,
      type: 'PRESENTIAL',
      status: 'AGENDADO',
      subjective: ' Dor lombar ',
      objective: '',
      assessment: 'Boa evolução',
      plan: 'Manter protocolo',
    })

    expect(mockCreateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        patientId: 'patient-1',
        duration: 50,
        type: 'PRESENTIAL',
        status: 'AGENDADO',
        subjective: 'Dor lombar',
        objective: null,
        assessment: 'Boa evolução',
        plan: 'Manter protocolo',
      })
    )
    expect(mockSyncSessionCalendarAfterMutation).toHaveBeenCalledWith({
      userId: 'user-1',
      sessionId: 'session-1',
      syncWithGoogleCalendar: undefined,
      status: 'AGENDADO',
    })
  })

  it('rejeita patientId de outro usuário', async () => {
    mockFindPatientById.mockResolvedValue(null)

    await expect(
      createSessionUseCase('user-1', {
        patientId: 'patient-other',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        type: 'PRESENTIAL',
        status: 'AGENDADO',
      })
    ).rejects.toBeInstanceOf(PatientNotFoundError)
  })

  it('rejeita sessão agendada no passado', async () => {
    mockFindPatientById.mockResolvedValue({ id: 'patient-1' } as never)

    await expect(
      createSessionUseCase('user-1', {
        patientId: 'patient-1',
        date: '2024-01-01T10:00:00.000Z',
        duration: 60,
        type: 'PRESENTIAL',
        status: 'AGENDADO',
      })
    ).rejects.toBeInstanceOf(InvalidSessionScheduleError)
  })
})
