import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listSessionsUseCase } from './list-sessions'
import { listSessions } from '../infra/session.repository'

vi.mock('../infra/session.repository')

const mockListSessions = vi.mocked(listSessions)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listSessionsUseCase', () => {
  it('filtra sessões pelo userId do fisioterapeuta', async () => {
    mockListSessions.mockResolvedValue({ sessions: [], total: 0 })

    await listSessionsUseCase('user-a')

    expect(mockListSessions).toHaveBeenCalledWith('user-a', expect.any(Object))
  })

  it('passa filtros de patientId, status e área para o repositório', async () => {
    mockListSessions.mockResolvedValue({ sessions: [], total: 0 })

    await listSessionsUseCase('user-b', {
      patientId: 'patient-1',
      status: 'AGENDADO',
      area: 'ORTOPEDICA',
      from: '2026-04-24T10:00:00.000Z',
      page: 2,
      limit: 15,
      order: 'asc',
    })

    expect(mockListSessions).toHaveBeenCalledWith(
      'user-b',
      expect.objectContaining({
        patientId: 'patient-1',
        status: 'AGENDADO',
        area: 'ORTOPEDICA',
        from: expect.any(Date),
        page: 2,
        limit: 15,
        order: 'asc',
      })
    )
    expect(mockListSessions).not.toHaveBeenCalledWith('user-a', expect.anything())
  })

  it('retorna a lista devolvida pelo repositório', async () => {
    const payload = { sessions: [{ id: 'session-1' }], total: 1 }
    mockListSessions.mockResolvedValue(payload as never)

    const result = await listSessionsUseCase('user-c')

    expect(result).toBe(payload)
  })
})
