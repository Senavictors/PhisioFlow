import { prisma } from '@/lib/prisma'
import type { SessionStatus, SessionType, TherapyArea } from '@/generated/prisma/client'

const APP_TZ = 'America/Sao_Paulo'

function dayKey(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: APP_TZ }).format(date)
}

function shortDayLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00Z`)
  const label = new Intl.DateTimeFormat('pt-BR', { timeZone: APP_TZ, weekday: 'short' })
    .format(date)
    .replace('.', '')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export interface RecentSessionItem {
  id: string
  patientName: string
  type: SessionType
  area: TherapyArea
  date: string
  status: SessionStatus
  isHomeCare: boolean
}

export interface DashboardMetrics {
  activePatients: number
  sessionsToday: number
  patientsWithoutReturn: number
  weeklySessions: { day: string; count: number }[]
  recentSessions: RecentSessionItem[]
}

export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const now = new Date()
  const todayKey = dayKey(now)
  const todayStart = new Date(`${todayKey}T00:00:00-03:00`)
  const todayEnd = new Date(`${todayKey}T23:59:59.999-03:00`)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const weekDayKeys = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
    return dayKey(d)
  })
  const weekStart = new Date(`${weekDayKeys[0]}T00:00:00-03:00`)

  const [
    activePatients,
    sessionsToday,
    patientsWithRecentSession,
    weekSessionsRaw,
    recentSessionsRaw,
  ] = await Promise.all([
    prisma.patient.count({
      where: { userId, isActive: true },
    }),
    prisma.session.count({
      where: {
        userId,
        status: 'REALIZADO',
        isActive: true,
        date: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.session.findMany({
      where: {
        userId,
        status: 'REALIZADO',
        isActive: true,
        date: { gte: thirtyDaysAgo },
        patient: { isActive: true },
      },
      select: { patientId: true },
      distinct: ['patientId'],
    }),
    prisma.session.findMany({
      where: {
        userId,
        status: 'REALIZADO',
        isActive: true,
        date: { gte: weekStart },
      },
      select: { date: true },
    }),
    prisma.session.findMany({
      where: { userId, isActive: true },
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        patient: { select: { name: true, area: true } },
      },
    }),
  ])

  const recentPatientIds = patientsWithRecentSession.map(s => s.patientId)
  const patientsWithoutReturn = await prisma.patient.count({
    where: {
      userId,
      isActive: true,
      ...(recentPatientIds.length > 0 ? { id: { notIn: recentPatientIds } } : {}),
    },
  })

  const countByDay = new Map<string, number>(weekDayKeys.map(k => [k, 0]))
  for (const s of weekSessionsRaw) {
    const k = dayKey(s.date)
    if (countByDay.has(k)) countByDay.set(k, (countByDay.get(k) ?? 0) + 1)
  }

  const weeklySessions = weekDayKeys.map(k => ({
    day: shortDayLabel(k),
    count: countByDay.get(k) ?? 0,
  }))

  const recentSessions: RecentSessionItem[] = recentSessionsRaw.map(s => ({
    id: s.id,
    patientName: s.patient.name,
    type: s.type,
    area: s.patient.area,
    date: s.date.toISOString(),
    status: s.status,
    isHomeCare: s.type === 'HOME_CARE',
  }))

  return { activePatients, sessionsToday, patientsWithoutReturn, weeklySessions, recentSessions }
}
