import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPatientUseCase, PatientNotFoundError } from './get-patient'
import * as repo from '../infra/patient.repository'

vi.mock('../infra/patient.repository')

const mockFind = vi.mocked(repo.findPatientById)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getPatientUseCase', () => {
  it('retorna paciente quando pertence ao userId correto', async () => {
    const patient = { id: 'p1', userId: 'u1', name: 'João' }
    mockFind.mockResolvedValue(patient as never)

    const result = await getPatientUseCase('p1', 'u1')

    expect(mockFind).toHaveBeenCalledWith('p1', 'u1')
    expect(result).toBe(patient)
  })

  it('lança PatientNotFoundError quando paciente não existe', async () => {
    mockFind.mockResolvedValue(null)

    await expect(getPatientUseCase('p999', 'u1')).rejects.toThrow(PatientNotFoundError)
  })

  it('lança PatientNotFoundError quando paciente pertence a outro userId', async () => {
    mockFind.mockResolvedValue(null)

    await expect(getPatientUseCase('p1', 'outro-user')).rejects.toThrow(PatientNotFoundError)
    expect(mockFind).toHaveBeenCalledWith('p1', 'outro-user')
  })
})
