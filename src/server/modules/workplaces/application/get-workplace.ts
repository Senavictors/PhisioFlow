import { WorkplaceNotFoundError } from '../domain/workplace'
import { findWorkplaceById } from '../infra/workplace.repository'

export { WorkplaceNotFoundError }

export async function getWorkplaceUseCase(id: string, userId: string) {
  const workplace = await findWorkplaceById(id, userId)
  if (!workplace) throw new WorkplaceNotFoundError()
  return workplace
}
