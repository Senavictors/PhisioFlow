import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PatientNotFoundError } from '@/server/modules/patients/application/get-patient'
import { findPatientById } from '@/server/modules/patients/infra/patient.repository'
import { findWorkplaceById } from '@/server/modules/workplaces/infra/workplace.repository'
import { WorkplaceForPlanNotFoundError } from '../domain/treatment-plan'
import { createTreatmentPlan } from '../infra/treatment-plan.repository'
import { createTreatmentPlanUseCase } from './create-treatment-plan'

vi.mock('@/server/modules/patients/infra/patient.repository')
vi.mock('@/server/modules/workplaces/infra/workplace.repository')
vi.mock('../infra/treatment-plan.repository')

const mockFindPatientById = vi.mocked(findPatientById)
const mockFindWorkplaceById = vi.mocked(findWorkplaceById)
const mockCreateTreatmentPlan = vi.mocked(createTreatmentPlan)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createTreatmentPlanUseCase', () => {
  it('cria plano para paciente e local do usuário', async () => {
    mockFindPatientById.mockResolvedValue({ id: 'patient-1', userId: 'user-1' } as never)
    mockFindWorkplaceById.mockResolvedValue({ id: 'workplace-1', userId: 'user-1' } as never)
    mockCreateTreatmentPlan.mockResolvedValue({ id: 'plan-1' } as never)

    const result = await createTreatmentPlanUseCase('user-1', 'patient-1', {
      workplaceId: 'workplace-1',
      area: 'ORTOPEDICA',
      specialties: ['PILATES'],
      attendanceType: 'CLINIC',
      pricingModel: 'PACKAGE',
      totalSessions: 10,
      packageAmount: 1500,
      startsAt: '2026-04-25',
      notes: ' Plano inicial ',
    })

    expect(result).toEqual({ id: 'plan-1' })
    expect(mockCreateTreatmentPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        patientId: 'patient-1',
        workplaceId: 'workplace-1',
        area: 'ORTOPEDICA',
        specialties: ['PILATES'],
        attendanceType: 'CLINIC',
        pricingModel: 'PACKAGE',
        totalSessions: 10,
        packageAmount: 1500,
        notes: 'Plano inicial',
      })
    )
  })

  it('rejeita paciente de outro usuário', async () => {
    mockFindPatientById.mockResolvedValue(null)

    await expect(
      createTreatmentPlanUseCase('user-1', 'patient-other', {
        workplaceId: 'workplace-1',
        area: 'ORTOPEDICA',
        specialties: [],
        attendanceType: 'CLINIC',
        pricingModel: 'PER_SESSION',
      })
    ).rejects.toBeInstanceOf(PatientNotFoundError)

    expect(mockCreateTreatmentPlan).not.toHaveBeenCalled()
  })

  it('rejeita local de trabalho de outro usuário', async () => {
    mockFindPatientById.mockResolvedValue({ id: 'patient-1', userId: 'user-1' } as never)
    mockFindWorkplaceById.mockResolvedValue(null)

    await expect(
      createTreatmentPlanUseCase('user-1', 'patient-1', {
        workplaceId: 'workplace-other',
        area: 'ESTETICA',
        specialties: [],
        attendanceType: 'HOME_CARE',
        pricingModel: 'PER_SESSION',
      })
    ).rejects.toBeInstanceOf(WorkplaceForPlanNotFoundError)

    expect(mockCreateTreatmentPlan).not.toHaveBeenCalled()
  })
})
