import type { AttendanceType, WorkplaceKind } from '@/generated/prisma/client'
import type { CreateWorkplaceDTO } from '../http/workplace.dto'
import { createWorkplace } from '../infra/workplace.repository'

export async function createWorkplaceUseCase(userId: string, dto: CreateWorkplaceDTO) {
  return createWorkplace({
    userId,
    name: dto.name,
    kind: dto.kind as WorkplaceKind,
    defaultAttendanceType: dto.defaultAttendanceType as AttendanceType,
    address: dto.address,
    defaultSessionPrice: dto.defaultSessionPrice,
    defaultCommissionPct: dto.defaultCommissionPct,
    notes: dto.notes,
  })
}
