import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPatientUseCase, PatientEmailAlreadyExistsError } from './create-patient'
import * as repo from '../infra/patient.repository'

vi.mock('../infra/patient.repository')

const mockCreate = vi.mocked(repo.createPatient)
const mockFindByEmail = vi.mocked(repo.findPatientByEmail)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createPatientUseCase', () => {
  it('cria paciente com dados válidos', async () => {
    const expected = { id: 'p1', name: 'João Silva', userId: 'u1' }
    mockCreate.mockResolvedValue(expected as never)

    const result = await createPatientUseCase('u1', {
      name: 'João Silva',
      classification: 'STANDARD',
    })

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', name: 'João Silva' })
    )
    expect(result).toBe(expected)
  })

  it('converte birthDate string para Date', async () => {
    mockCreate.mockResolvedValue({} as never)

    await createPatientUseCase('u1', {
      name: 'Maria',
      classification: 'ELDERLY',
      birthDate: '1950-01-01',
    })

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ birthDate: new Date('1950-01-01') })
    )
  })

  it('converte email vazio para null', async () => {
    mockCreate.mockResolvedValue({} as never)

    await createPatientUseCase('u1', {
      name: 'Ana',
      classification: 'STANDARD',
      email: '',
    })

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ email: null }))
  })

  it('cria prontuário base quando recebe dados clínicos', async () => {
    mockCreate.mockResolvedValue({} as never)

    await createPatientUseCase('u1', {
      name: 'Lucas',
      classification: 'POST_ACCIDENT',
      mainComplaint: 'Dor lombar persistente',
      allergies: 'Lactose',
    })

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        clinicalRecord: expect.objectContaining({
          mainComplaint: 'Dor lombar persistente',
          allergies: 'Lactose',
        }),
      })
    )
  })

  it('rejeita e-mail duplicado para o mesmo fisioterapeuta', async () => {
    mockFindByEmail.mockResolvedValue({ id: 'p1', userId: 'u1' } as never)

    await expect(
      createPatientUseCase('u1', {
        name: 'Ana',
        classification: 'STANDARD',
        email: 'ana@exemplo.com',
      })
    ).rejects.toThrow(PatientEmailAlreadyExistsError)

    expect(mockCreate).not.toHaveBeenCalled()
  })
})
