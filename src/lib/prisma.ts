import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const requiredDelegates = [
  'user',
  'patient',
  'clinicalRecord',
  'session',
  'document',
  'emailSettings',
  'emailMessage',
  'calendarConnection',
  'calendarEventLink',
  'workplace',
  'treatmentPlan',
  'payment',
] as const

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
  return new PrismaClient({ adapter, log: ['error'] })
}

function canReusePrismaClient(client?: PrismaClient) {
  if (!client) return false

  const candidate = client as unknown as Record<string, unknown>
  return requiredDelegates.every((delegate) => delegate in candidate)
}

export const prisma = canReusePrismaClient(globalForPrisma.prisma)
  ? globalForPrisma.prisma!
  : createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
