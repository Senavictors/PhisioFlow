import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listWorkplacesUseCase } from './list-workplaces'
import { listWorkplaces } from '../infra/workplace.repository'

vi.mock('../infra/workplace.repository')
const mockListWorkplaces = vi.mocked(listWorkplaces)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listWorkplacesUseCase', () => {
  it('lista apenas workplaces ativos por default', async () => {
    mockListWorkplaces.mockResolvedValue([])

    await listWorkplacesUseCase('user-1', { includeArchived: false })

    expect(mockListWorkplaces).toHaveBeenCalledWith('user-1', false)
  })

  it('passa includeArchived=true ao repositório', async () => {
    mockListWorkplaces.mockResolvedValue([])

    await listWorkplacesUseCase('user-1', { includeArchived: true })

    expect(mockListWorkplaces).toHaveBeenCalledWith('user-1', true)
  })

  it('retorna objeto { workplaces }', async () => {
    const fakeList = [{ id: 'wp-1' }]
    mockListWorkplaces.mockResolvedValue(fakeList as never)

    const result = await listWorkplacesUseCase('user-1', { includeArchived: false })

    expect(result).toEqual({ workplaces: fakeList })
  })
})
