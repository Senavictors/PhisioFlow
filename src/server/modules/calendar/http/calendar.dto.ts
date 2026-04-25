import { z } from 'zod'

export const updateCalendarSettingsDTO = z.object({
  calendarId: z.string().trim().min(1, 'Selecione uma agenda'),
  calendarSummary: z.string().trim().max(200).optional(),
  syncNewSessionsByDefault: z.coerce.boolean().default(false),
})

export const syncSessionDTO = z.object({
  calendarId: z.string().trim().optional(),
})

export type UpdateCalendarSettingsDTO = z.infer<typeof updateCalendarSettingsDTO>
export type SyncSessionDTO = z.infer<typeof syncSessionDTO>
