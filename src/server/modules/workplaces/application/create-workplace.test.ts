import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createWorkplaceUseCase } from './create-workplace'
import { createWorkplace } from '../infra/workplace.repository'

vi.mock('../infra/workplace.repository')
const mockCreateWorkplace = vi.mocked(createWorkplace)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createWorkplaceUseCase', () => {
  it('cria workplace com dados válidos', async () => {
    mockCreateWorkplace.mockResolvedValue({ id: 'wp-1', name: 'Clínica Mova' } as never)

    await createWorkplaceUseCase('user-1', {
      name: 'Clínica Mova',
      kind: 'OWN_CLINIC',
      defaultAttendanceType: 'CLINIC',
    })

    expect(mockCreateWorkplace).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        name: 'Clínica Mova',
        kind: 'OWN_CLINIC',
        defaultAttendanceType: 'CLINIC',
      })
    )
  })

  it('propaga campos opcionais', async () => {
    mockCreateWorkplace.mockResolvedValue({ id: 'wp-2' } as never)

    await createWorkplaceUseCase('user-1', {
      name: 'Studio',
      kind: 'PARTICULAR',
      defaultAttendanceType: 'HOME_CARE',
      address: 'Rua A, 10',
      defaultSessionPrice: 200,
      defaultCommissionPct: 10,
      notes: 'Atendimento VIP',
    })

    expect(mockCreateWorkplace).toHaveBeenCalledWith(
      expect.objectContaining({
        address: 'Rua A, 10',
        defaultSessionPrice: 200,
        defaultCommissionPct: 10,
        notes: 'Atendimento VIP',
      })
    )
  })
})
