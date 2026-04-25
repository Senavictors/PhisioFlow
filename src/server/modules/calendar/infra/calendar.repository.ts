import { prisma } from '@/lib/prisma'
import type { CalendarSyncStatus } from '@/generated/prisma/client'

export async function findCalendarConnection(userId: string) {
  return prisma.calendarConnection.findUnique({
    where: { userId_provider: { userId, provider: 'GOOGLE' } },
  })
}

export interface CalendarConnectionUpsertInput {
  userId: string
  accountEmail: string
  encryptedRefreshToken: string
  encryptedAccessToken?: string | null
  accessTokenExpiresAt?: Date | null
}

export async function upsertCalendarConnection(input: CalendarConnectionUpsertInput) {
  return prisma.calendarConnection.upsert({
    where: { userId_provider: { userId: input.userId, provider: 'GOOGLE' } },
    update: {
      accountEmail: input.accountEmail,
      encryptedRefreshToken: input.encryptedRefreshToken,
      encryptedAccessToken: input.encryptedAccessToken ?? null,
      accessTokenExpiresAt: input.accessTokenExpiresAt ?? null,
    },
    create: {
      userId: input.userId,
      provider: 'GOOGLE',
      accountEmail: input.accountEmail,
      encryptedRefreshToken: input.encryptedRefreshToken,
      encryptedAccessToken: input.encryptedAccessToken ?? null,
      accessTokenExpiresAt: input.accessTokenExpiresAt ?? null,
    },
  })
}

export async function updateCalendarTokens(
  userId: string,
  data: { encryptedAccessToken: string; accessTokenExpiresAt: Date }
) {
  return prisma.calendarConnection.update({
    where: { userId_provider: { userId, provider: 'GOOGLE' } },
    data,
  })
}

export async function updateCalendarSettings(
  userId: string,
  data: {
    calendarId: string
    calendarSummary?: string | null
    syncNewSessionsByDefault: boolean
  }
) {
  return prisma.calendarConnection.update({
    where: { userId_provider: { userId, provider: 'GOOGLE' } },
    data: {
      calendarId: data.calendarId,
      calendarSummary: data.calendarSummary ?? null,
      syncNewSessionsByDefault: data.syncNewSessionsByDefault,
    },
  })
}

export async function deleteCalendarConnection(userId: string) {
  return prisma.calendarConnection.delete({
    where: { userId_provider: { userId, provider: 'GOOGLE' } },
  })
}

export interface CalendarEventLinkUpsertInput {
  userId: string
  sessionId: string
  externalEventId: string
  calendarId: string
  status?: CalendarSyncStatus
  errorMessage?: string | null
}

export async function upsertCalendarEventLink(input: CalendarEventLinkUpsertInput) {
  return prisma.calendarEventLink.upsert({
    where: { sessionId_provider: { sessionId: input.sessionId, provider: 'GOOGLE' } },
    update: {
      externalEventId: input.externalEventId,
      calendarId: input.calendarId,
      status: input.status ?? 'SYNCED',
      errorMessage: input.errorMessage ?? null,
      lastSyncedAt: new Date(),
    },
    create: {
      userId: input.userId,
      sessionId: input.sessionId,
      provider: 'GOOGLE',
      externalEventId: input.externalEventId,
      calendarId: input.calendarId,
      status: input.status ?? 'SYNCED',
      errorMessage: input.errorMessage ?? null,
      lastSyncedAt: new Date(),
    },
  })
}

export async function findCalendarEventLink(sessionId: string, userId: string) {
  return prisma.calendarEventLink.findFirst({
    where: { sessionId, userId, provider: 'GOOGLE' },
  })
}

export async function findCalendarEventLinksForSessions(userId: string, sessionIds: string[]) {
  if (sessionIds.length === 0) return []
  return prisma.calendarEventLink.findMany({
    where: { userId, provider: 'GOOGLE', sessionId: { in: sessionIds } },
  })
}

export async function markCalendarEventLinkRemoved(linkId: string) {
  return prisma.calendarEventLink.update({
    where: { id: linkId },
    data: { status: 'REMOVED', errorMessage: null, lastSyncedAt: new Date() },
  })
}

export async function markCalendarEventLinkFailed(linkId: string, errorMessage: string) {
  return prisma.calendarEventLink.update({
    where: { id: linkId },
    data: {
      status: 'FAILED',
      errorMessage,
      lastSyncedAt: new Date(),
    },
  })
}

export async function deleteCalendarEventLink(linkId: string) {
  return prisma.calendarEventLink.delete({ where: { id: linkId } })
}
