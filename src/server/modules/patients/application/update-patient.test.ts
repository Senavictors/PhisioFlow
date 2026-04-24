import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as repo from '../infra/patient.repository'
import { updatePatientUseCase } from './update-patient'
import { PatientEmailAlreadyExistsError } from './create-patient'

vi.mock('../infra/patient.repository')

const mockFindById = vi.mocked(repo.findPatientById)
const mockFindByEmail = vi.mocked(repo.findPatientByEmail)
const mockUpdate = vi.mocked(repo.updatePatient)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('updatePatientUseCase', () => {
  it('rejeita e-mail já usado por outro paciente ativo', async () => {
    mockFindById.mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      email: 'atual@exemplo.com',
      clinicalRecord: null,
    } as never)
    mockFindByEmail.mockResolvedValue({ id: 'p2', userId: 'u1' } as never)

    await expect(
      updatePatientUseCase('p1', 'u1', {
        email: 'duplicado@exemplo.com',
      })
    ).rejects.toThrow(PatientEmailAlreadyExistsError)

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('permite limpar campos do prontuário existente', async () => {
    mockFindById.mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      email: 'paciente@exemplo.com',
      clinicalRecord: { id: 'cr1' },
    } as never)
    mockUpdate.mockResolvedValue({ id: 'p1' } as never)

    await updatePatientUseCase('p1', 'u1', {
      mainComplaint: '',
      medicalHistory: '',
      medications: '',
      allergies: '',
    })

    expect(mockUpdate).toHaveBeenCalledWith(
      'p1',
      expect.any(Object),
      expect.objectContaining({
        mainComplaint: null,
        medicalHistory: null,
        medications: null,
        allergies: null,
      })
    )
  })
})
