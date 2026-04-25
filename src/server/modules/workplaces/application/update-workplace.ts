import type { AttendanceType, WorkplaceKind } from '@/generated/prisma/client'
import { WorkplaceNotFoundError } from '../domain/workplace'
import type { UpdateWorkplaceDTO } from '../http/workplace.dto'
import { findWorkplaceById, updateWorkplace } from '../infra/workplace.repository'

export async function updateWorkplaceUseCase(id: string, userId: string, dto: UpdateWorkplaceDTO) {
  const existing = await findWorkplaceById(id, userId)
  if (!existing) throw new WorkplaceNotFoundError()

  return updateWorkplace(id, {
    name: dto.name,
    kind: dto.kind as WorkplaceKind | undefined,
    defaultAttendanceType: dto.defaultAttendanceType as AttendanceType | undefined,
    address: dto.address,
    defaultSessionPrice: dto.defaultSessionPrice,
    defaultCommissionPct: dto.defaultCommissionPct,
    notes: dto.notes,
  })
}
