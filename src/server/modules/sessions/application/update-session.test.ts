import { beforeEach, describe, expect, it, vi } from 'vitest'
import { updateSessionUseCase } from './update-session'
import { findSessionById, updateSession } from '../infra/session.repository'
import { SessionNotFoundError } from './get-session'
import { syncSessionCalendarAfterMutation } from '@/server/modules/calendar/application/auto-sync-session-calendar'

vi.mock('../infra/session.repository')
vi.mock('@/server/modules/calendar/application/auto-sync-session-calendar')

const mockFindSessionById = vi.mocked(findSessionById)
const mockUpdateSession = vi.mocked(updateSession)
const mockSyncSessionCalendarAfterMutation = vi.mocked(syncSessionCalendarAfterMutation)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('updateSessionUseCase', () => {
  it('atualiza campos SOAP parciais corretamente', async () => {
    mockFindSessionById.mockResolvedValue({
      id: 'session-1',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'AGENDADO',
    } as never)
    mockUpdateSession.mockResolvedValue({ id: 'session-1' } as never)

    await updateSessionUseCase('session-1', 'user-1', {
      status: 'REALIZADO',
      subjective: 'Paciente sem dor ao repouso',
      objective: '',
      plan: 'Revisar carga na próxima semana',
    })

    expect(mockUpdateSession).toHaveBeenCalledWith(
      'session-1',
      expect.objectContaining({
        status: 'REALIZADO',
        subjective: 'Paciente sem dor ao repouso',
        objective: null,
        plan: 'Revisar carga na próxima semana',
      })
    )
    expect(mockSyncSessionCalendarAfterMutation).toHaveBeenCalledWith({
      userId: 'user-1',
      sessionId: 'session-1',
      syncWithGoogleCalendar: undefined,
      status: 'REALIZADO',
    })
  })

  it('lança erro quando a sessão não pertence ao usuário', async () => {
    mockFindSessionById.mockResolvedValue(null)

    await expect(
      updateSessionUseCase('session-1', 'user-1', { status: 'CANCELADO' })
    ).rejects.toBeInstanceOf(SessionNotFoundError)
  })
})
