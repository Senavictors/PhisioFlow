import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TreatmentPlanNotFoundError } from '../domain/treatment-plan'
import { findTreatmentPlanById, setTreatmentPlanStatus } from '../infra/treatment-plan.repository'
import {
  cancelTreatmentPlanUseCase,
  completeTreatmentPlanUseCase,
  pauseTreatmentPlanUseCase,
  resumeTreatmentPlanUseCase,
} from './change-status'

vi.mock('../infra/treatment-plan.repository')

const mockFindTreatmentPlanById = vi.mocked(findTreatmentPlanById)
const mockSetTreatmentPlanStatus = vi.mocked(setTreatmentPlanStatus)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('changeTreatmentPlanStatus use cases', () => {
  it('altera status preservando filtro por userId', async () => {
    mockFindTreatmentPlanById.mockResolvedValue({ id: 'plan-1', userId: 'user-1' } as never)
    mockSetTreatmentPlanStatus.mockResolvedValue({ id: 'plan-1', status: 'PAUSED' } as never)

    await pauseTreatmentPlanUseCase('plan-1', 'user-1')

    expect(mockFindTreatmentPlanById).toHaveBeenCalledWith('plan-1', 'user-1')
    expect(mockSetTreatmentPlanStatus).toHaveBeenCalledWith('plan-1', 'PAUSED')
  })

  it('expoe acoes de retomar, concluir e cancelar', async () => {
    mockFindTreatmentPlanById.mockResolvedValue({ id: 'plan-1', userId: 'user-1' } as never)
    mockSetTreatmentPlanStatus.mockResolvedValue({ id: 'plan-1' } as never)

    await resumeTreatmentPlanUseCase('plan-1', 'user-1')
    await completeTreatmentPlanUseCase('plan-1', 'user-1')
    await cancelTreatmentPlanUseCase('plan-1', 'user-1')

    expect(mockSetTreatmentPlanStatus).toHaveBeenNthCalledWith(1, 'plan-1', 'ACTIVE')
    expect(mockSetTreatmentPlanStatus).toHaveBeenNthCalledWith(2, 'plan-1', 'COMPLETED')
    expect(mockSetTreatmentPlanStatus).toHaveBeenNthCalledWith(3, 'plan-1', 'CANCELED')
  })

  it('rejeita plano inexistente ou de outro usuário', async () => {
    mockFindTreatmentPlanById.mockResolvedValue(null)

    await expect(pauseTreatmentPlanUseCase('plan-other', 'user-1')).rejects.toBeInstanceOf(
      TreatmentPlanNotFoundError
    )

    expect(mockSetTreatmentPlanStatus).not.toHaveBeenCalled()
  })
})
