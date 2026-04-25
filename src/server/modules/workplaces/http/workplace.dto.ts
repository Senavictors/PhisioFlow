import { z } from 'zod'

const workplaceKind = z.enum(['OWN_CLINIC', 'PARTNER_CLINIC', 'PARTICULAR', 'ONLINE'])
const attendanceTypeEnum = z.enum(['CLINIC', 'HOME_CARE', 'HOSPITAL', 'CORPORATE', 'ONLINE'])
const optionalText = z.string().trim().optional()

export const createWorkplaceDTO = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(120, 'Nome muito longo'),
  kind: workplaceKind,
  defaultAttendanceType: attendanceTypeEnum,
  address: optionalText,
  defaultSessionPrice: z.coerce.number().nonnegative().optional(),
  defaultCommissionPct: z.coerce.number().min(0).max(100).optional(),
  notes: optionalText,
})

export const updateWorkplaceDTO = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  kind: workplaceKind.optional(),
  defaultAttendanceType: attendanceTypeEnum.optional(),
  address: optionalText,
  defaultSessionPrice: z.coerce.number().nonnegative().optional(),
  defaultCommissionPct: z.coerce.number().min(0).max(100).optional(),
  notes: optionalText,
})

export const listWorkplacesDTO = z.object({
  includeArchived: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
})

export type CreateWorkplaceDTO = z.infer<typeof createWorkplaceDTO>
export type UpdateWorkplaceDTO = z.infer<typeof updateWorkplaceDTO>
export type ListWorkplacesDTO = z.infer<typeof listWorkplacesDTO>
