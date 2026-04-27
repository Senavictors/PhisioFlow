import { prisma } from '@/lib/prisma'
import type { Prisma, TherapyArea } from '@/generated/prisma/client'
import type {
  FinanceBreakdownByArea,
  FinanceBreakdownByWorkplace,
  FinancePendingPayment,
  FinanceSeriesPoint,
  FinanceSummary,
  Granularity,
} from '../domain/finance'

interface UseCaseInput {
  userId: string
  from: Date
  to: Date
  granularity: Granularity
  workplaceIds?: string[]
  areas?: TherapyArea[]
}

function toMoneyString(value: number) {
  return value.toFixed(2)
}

function clampDate(value: Date) {
  const next = new Date(value.getTime())
  next.setHours(0, 0, 0, 0)
  return next
}

function endOfDay(value: Date) {
  const next = new Date(value.getTime())
  next.setHours(23, 59, 59, 999)
  return next
}

function startOfWeek(value: Date) {
  const next = clampDate(value)
  const day = next.getDay() // 0 = Sun
  const diff = day === 0 ? 6 : day - 1
  next.setDate(next.getDate() - diff)
  return next
}

function startOfMonth(value: Date) {
  const next = clampDate(value)
  next.setDate(1)
  return next
}

function bucketKey(date: Date, granularity: Granularity) {
  let bucket: Date
  if (granularity === 'week') bucket = startOfWeek(date)
  else if (granularity === 'month') bucket = startOfMonth(date)
  else bucket = clampDate(date)
  const y = bucket.getFullYear()
  const m = String(bucket.getMonth() + 1).padStart(2, '0')
  const d = String(bucket.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function enumerateBuckets(from: Date, to: Date, granularity: Granularity) {
  const keys = new Set<string>()
  const current = clampDate(from)
  const limit = clampDate(to)
  while (current <= limit) {
    keys.add(bucketKey(current, granularity))
    if (granularity === 'week') current.setDate(current.getDate() + 7)
    else if (granularity === 'month') current.setMonth(current.getMonth() + 1)
    else current.setDate(current.getDate() + 1)
  }
  return Array.from(keys)
}

export async function getFinanceSummaryUseCase(input: UseCaseInput): Promise<FinanceSummary> {
  const { userId, from, to, granularity, workplaceIds, areas } = input

  const workplaceFilter = workplaceIds && workplaceIds.length > 0 ? workplaceIds : undefined
  const areaFilter = areas && areas.length > 0 ? areas : undefined

  // 1. Pagamentos recebidos no período (status PAID/PARTIAL)
  const paymentsInRange = await prisma.payment.findMany({
    where: {
      userId,
      status: { in: ['PAID', 'PARTIAL'] },
      paidAt: { gte: from, lte: to },
      ...(workplaceFilter || areaFilter
        ? {
            OR: [
              {
                treatmentPlan: {
                  ...(workplaceFilter ? { workplaceId: { in: workplaceFilter } } : {}),
                  ...(areaFilter ? { area: { in: areaFilter } } : {}),
                },
              },
              {
                session: {
                  ...(workplaceFilter ? { workplaceId: { in: workplaceFilter } } : {}),
                  ...(areaFilter ? { treatmentPlan: { area: { in: areaFilter } } } : {}),
                },
              },
            ],
          }
        : {}),
    },
    include: {
      treatmentPlan: { select: { workplaceId: true, area: true } },
      session: {
        select: {
          workplaceId: true,
          treatmentPlan: { select: { area: true } },
        },
      },
    },
  })

  // 2. Sessões agendadas com previsão de cobrança no período
  const forecastSessions = await prisma.session.findMany({
    where: {
      userId,
      isActive: true,
      status: 'AGENDADO',
      date: { gte: from, lte: to },
      expectedFee: { gt: 0 },
      paymentStatus: { in: ['PENDING', 'PARTIAL'] },
      ...(workplaceFilter ? { workplaceId: { in: workplaceFilter } } : {}),
      ...(areaFilter ? { treatmentPlan: { area: { in: areaFilter } } } : {}),
    },
    select: {
      id: true,
      date: true,
      expectedFee: true,
      workplaceId: true,
      treatmentPlan: { select: { area: true } },
    },
  })

  // 3. Parcelas pendentes de pacote no período (Payment.status=PENDING com dueAt)
  const forecastInstallments = await prisma.payment.findMany({
    where: {
      userId,
      status: 'PENDING',
      dueAt: { gte: from, lte: to },
      ...(workplaceFilter || areaFilter
        ? {
            treatmentPlan: {
              ...(workplaceFilter ? { workplaceId: { in: workplaceFilter } } : {}),
              ...(areaFilter ? { area: { in: areaFilter } } : {}),
            },
          }
        : {}),
    },
    select: {
      id: true,
      amount: true,
      dueAt: true,
      method: true,
      notes: true,
      treatmentPlan: {
        select: {
          workplaceId: true,
          area: true,
          patient: { select: { name: true } },
        },
      },
    },
  })

  // 4. Período anterior — recebido (mesmo tamanho)
  const periodMs = endOfDay(to).getTime() - clampDate(from).getTime()
  const previousFrom = new Date(clampDate(from).getTime() - periodMs - 1)
  const previousTo = new Date(clampDate(from).getTime() - 1)
  const previousAgg = await prisma.payment.aggregate({
    where: {
      userId,
      status: { in: ['PAID', 'PARTIAL'] },
      paidAt: { gte: previousFrom, lte: previousTo },
    },
    _sum: { amount: true },
  })
  const previousReceived = Number(previousAgg._sum.amount ?? 0)

  // 5. Totais e séries
  const totalReceived = paymentsInRange.reduce((sum, p) => sum + Number(p.amount), 0)
  const forecastPerSession = forecastSessions.reduce(
    (sum, s) => sum + (s.expectedFee ? Number(s.expectedFee) : 0),
    0
  )
  const forecastPackages = forecastInstallments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalForecast = forecastPerSession + forecastPackages

  const buckets = enumerateBuckets(from, to, granularity)
  const seriesMap: Record<string, { received: number; forecast: number }> = {}
  for (const key of buckets) seriesMap[key] = { received: 0, forecast: 0 }

  for (const payment of paymentsInRange) {
    const key = bucketKey(payment.paidAt, granularity)
    if (!seriesMap[key]) seriesMap[key] = { received: 0, forecast: 0 }
    seriesMap[key].received += Number(payment.amount)
  }
  for (const session of forecastSessions) {
    const key = bucketKey(session.date, granularity)
    if (!seriesMap[key]) seriesMap[key] = { received: 0, forecast: 0 }
    seriesMap[key].forecast += session.expectedFee ? Number(session.expectedFee) : 0
  }
  for (const installment of forecastInstallments) {
    if (!installment.dueAt) continue
    const key = bucketKey(installment.dueAt, granularity)
    if (!seriesMap[key]) seriesMap[key] = { received: 0, forecast: 0 }
    seriesMap[key].forecast += Number(installment.amount)
  }

  const series: FinanceSeriesPoint[] = Object.entries(seriesMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bucket, totals]) => ({
      bucket,
      received: toMoneyString(totals.received),
      forecast: toMoneyString(totals.forecast),
    }))

  // 6. Breakdown por workplace
  const workplaceLookup = await prisma.workplace.findMany({
    where: { userId },
    select: { id: true, name: true },
  })
  const workplaceNames = new Map(workplaceLookup.map((w) => [w.id, w.name]))

  const workplaceTotals: Record<string, { received: number; forecast: number }> = {}
  function addWorkplace(
    id: string | null | undefined,
    kind: 'received' | 'forecast',
    value: number
  ) {
    if (!id) return
    if (!workplaceTotals[id]) workplaceTotals[id] = { received: 0, forecast: 0 }
    workplaceTotals[id][kind] += value
  }

  for (const payment of paymentsInRange) {
    const id = payment.treatmentPlan?.workplaceId ?? payment.session?.workplaceId ?? null
    addWorkplace(id, 'received', Number(payment.amount))
  }
  for (const session of forecastSessions) {
    addWorkplace(
      session.workplaceId,
      'forecast',
      session.expectedFee ? Number(session.expectedFee) : 0
    )
  }
  for (const installment of forecastInstallments) {
    addWorkplace(installment.treatmentPlan?.workplaceId, 'forecast', Number(installment.amount))
  }

  const byWorkplace: FinanceBreakdownByWorkplace[] = Object.entries(workplaceTotals)
    .map(([id, totals]) => ({
      workplaceId: id,
      name: workplaceNames.get(id) ?? 'Local removido',
      received: toMoneyString(totals.received),
      forecast: toMoneyString(totals.forecast),
    }))
    .sort(
      (a, b) => Number(b.received) + Number(b.forecast) - (Number(a.received) + Number(a.forecast))
    )

  // 7. Breakdown por área
  const areaTotals: Record<string, { received: number; forecast: number }> = {}
  function addArea(area: string | null | undefined, kind: 'received' | 'forecast', value: number) {
    if (!area) return
    if (!areaTotals[area]) areaTotals[area] = { received: 0, forecast: 0 }
    areaTotals[area][kind] += value
  }

  for (const payment of paymentsInRange) {
    const area = payment.treatmentPlan?.area ?? payment.session?.treatmentPlan?.area ?? null
    addArea(area, 'received', Number(payment.amount))
  }
  for (const session of forecastSessions) {
    addArea(
      session.treatmentPlan?.area,
      'forecast',
      session.expectedFee ? Number(session.expectedFee) : 0
    )
  }
  for (const installment of forecastInstallments) {
    addArea(installment.treatmentPlan?.area, 'forecast', Number(installment.amount))
  }

  const byArea: FinanceBreakdownByArea[] = Object.entries(areaTotals)
    .map(([area, totals]) => ({
      area,
      received: toMoneyString(totals.received),
      forecast: toMoneyString(totals.forecast),
    }))
    .sort(
      (a, b) => Number(b.received) + Number(b.forecast) - (Number(a.received) + Number(a.forecast))
    )

  // 8. Pendências (Payment.status=PENDING, ordem por dueAt asc, top 50)
  const pendingPaymentsRaw = await prisma.payment.findMany({
    where: {
      userId,
      status: 'PENDING',
      ...(workplaceFilter || areaFilter
        ? {
            treatmentPlan: {
              ...(workplaceFilter ? { workplaceId: { in: workplaceFilter } } : {}),
              ...(areaFilter ? { area: { in: areaFilter } } : {}),
            },
          }
        : {}),
    },
    take: 50,
    orderBy: [{ dueAt: 'asc' }, { createdAt: 'asc' }],
    include: {
      treatmentPlan: {
        select: {
          id: true,
          area: true,
          pricingModel: true,
          patient: { select: { id: true, name: true } },
        },
      },
      session: {
        select: {
          patient: { select: { id: true, name: true } },
          treatmentPlan: { select: { area: true } },
        },
      },
    },
  } satisfies Prisma.PaymentFindManyArgs)

  const pendingPayments: FinancePendingPayment[] = pendingPaymentsRaw.map((p) => {
    const patientName = p.treatmentPlan?.patient.name ?? p.session?.patient.name ?? 'Paciente'
    const area = p.treatmentPlan?.area ?? p.session?.treatmentPlan?.area ?? null
    const planLabel = p.treatmentPlan
      ? p.treatmentPlan.pricingModel === 'PACKAGE'
        ? `Pacote (${area ?? 'plano'})`
        : `Plano (${area ?? 'avulso'})`
      : 'Sessão avulsa'
    return {
      id: p.id,
      patientId: p.treatmentPlan?.patient.id ?? p.session?.patient.id ?? null,
      patientName,
      treatmentPlanId: p.treatmentPlan?.id ?? null,
      planLabel,
      amount: toMoneyString(Number(p.amount)),
      dueAt: p.dueAt ? p.dueAt.toISOString() : null,
      method: p.method,
    }
  })

  const deltaPct =
    previousReceived > 0
      ? ((totalReceived - previousReceived) / previousReceived) * 100
      : totalReceived > 0
        ? 100
        : 0

  return {
    range: {
      from: clampDate(from).toISOString().slice(0, 10),
      to: clampDate(to).toISOString().slice(0, 10),
      granularity,
    },
    totalReceived: toMoneyString(totalReceived),
    totalForecast: toMoneyString(totalForecast),
    forecastBySource: {
      perSession: toMoneyString(forecastPerSession),
      packageInstallments: toMoneyString(forecastPackages),
    },
    delta: {
      receivedVsPreviousPeriod: deltaPct.toFixed(1),
      previousReceived: toMoneyString(previousReceived),
    },
    series,
    byWorkplace,
    byArea,
    pendingPayments,
  }
}
