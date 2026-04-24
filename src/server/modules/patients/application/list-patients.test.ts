import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listPatientsUseCase } from './list-patients'
import * as repo from '../infra/patient.repository'

vi.mock('../infra/patient.repository')

const mockList = vi.mocked(repo.listPatients)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listPatientsUseCase', () => {
  it('filtra pacientes pelo userId do fisioterapeuta', async () => {
    mockList.mockResolvedValue([])

    await listPatientsUseCase('user-a')

    expect(mockList).toHaveBeenCalledWith('user-a', expect.any(Object))
  })

  it('não mescla pacientes de userId diferente', async () => {
    mockList.mockResolvedValue([])

    await listPatientsUseCase('user-b', { area: 'PILATES' })

    expect(mockList).toHaveBeenCalledWith('user-b', expect.objectContaining({ area: 'PILATES' }))
    expect(mockList).not.toHaveBeenCalledWith('user-a', expect.anything())
  })

  it('passa filtros de area e classification para o repositório', async () => {
    mockList.mockResolvedValue([])

    await listPatientsUseCase('u1', { area: 'MOTOR', classification: 'PCD', search: 'Rafael' })

    expect(mockList).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ area: 'MOTOR', classification: 'PCD', search: 'Rafael' }),
    )
  })

  it('retorna a lista devolvida pelo repositório', async () => {
    const patients = [{ id: 'p1', name: 'João' }, { id: 'p2', name: 'Maria' }]
    mockList.mockResolvedValue(patients as never)

    const result = await listPatientsUseCase('u1')

    expect(result).toBe(patients)
  })
})
