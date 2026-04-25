import { WorkplaceNotFoundError } from '../domain/workplace'
import { archiveWorkplace, findWorkplaceById } from '../infra/workplace.repository'

export async function archiveWorkplaceUseCase(id: string, userId: string) {
  const existing = await findWorkplaceById(id, userId)
  if (!existing) throw new WorkplaceNotFoundError()
  return archiveWorkplace(id)
}
