import type { ListWorkplacesDTO } from '../http/workplace.dto'
import { listWorkplaces } from '../infra/workplace.repository'

export async function listWorkplacesUseCase(userId: string, dto: ListWorkplacesDTO) {
  const workplaces = await listWorkplaces(userId, dto.includeArchived)
  return { workplaces }
}
