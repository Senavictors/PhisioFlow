import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      payment: {
        findMany: vi.fn(),
        aggregate: vi.fn(),
      },
      session: {
        findMany: vi.fn(),
      },
      workplace: {
        findMany: vi.fn(),
      },
    },
  }
})

import { prisma } from '@/lib/prisma'
import { getFinanceSummaryUseCase } from './get-finance-summary'

const mockPaymentFindMany = vi.mocked(prisma.payment.findMany)
const mockPaymentAggregate = vi.mocked(prisma.payment.aggregate)
const mockSessionFindMany = vi.mocked(prisma.session.findMany)
const mockWorkplaceFindMany = vi.mocked(prisma.workplace.findMany)

beforeEach(() => {
  vi.clearAllMocks()
  mockWorkplaceFindMany.mockResolvedValue([
    { id: 'wp-1', name: 'Clínica Movimento' },
    { id: 'wp-2', name: 'Atendimento Particular' },
  ] as never)
})

describe('getFinanceSummaryUseCase', () => {
  it('agrega recebido, previsto e quebras corretamente', async () => {
    // Pagamentos no período (PAID)
    mockPaymentFindMany.mockImplementation(((args: { where?: { status?: unknown } }) => {
      const status = args?.where?.status
      if (typeof status === 'object' && status && 'in' in status) {
        // recebidos
        return Promise.resolve([
          {
            amount: 200,
            paidAt: new Date('2026-04-10T12:00:00Z'),
            treatmentPlan: { workplaceId: 'wp-1', area: 'ORTOPEDICA' },
            session: null,
          },
          {
            amount: 300,
            paidAt: new Date('2026-04-15T12:00:00Z'),
            treatmentPlan: null,
            session: { workplaceId: 'wp-2', treatmentPlan: { area: 'ESTETICA' } },
          },
        ]) as never
      }
      if (status === 'PENDING') {
        // tabela de pendências OU parcelas
        // o use case chama findMany duas vezes para PENDING:
        //  - a primeira sem `take` nem `orderBy` (parcelas para forecast)
        //  - a segunda com `take: 50` e `orderBy` (lista de pendências)
        if ((args as { take?: number }).take === 50) {
          return Promise.resolve([
            {
              id: 'p-pend-1',
              amount: 150,
              dueAt: new Date('2026-05-01T00:00:00Z'),
              method: 'PIX',
              treatmentPlan: {
                id: 'plan-1',
                area: 'ORTOPEDICA',
                pricingModel: 'PACKAGE',
                patient: { id: 'pat-1', name: 'Maria Silva' },
              },
              session: null,
            },
          ]) as never
        }
        return Promise.resolve([
          {
            amount: 150,
            dueAt: new Date('2026-04-25T00:00:00Z'),
            method: 'PIX',
            notes: null,
            treatmentPlan: {
              workplaceId: 'wp-1',
              area: 'ORTOPEDICA',
              patient: { name: 'Maria Silva' },
            },
          },
        ]) as never
      }
      return Promise.resolve([]) as never
    }) as never)

    mockSessionFindMany.mockResolvedValue([
      {
        id: 's-future-1',
        date: new Date('2026-04-20T12:00:00Z'),
        expectedFee: 180,
        workplaceId: 'wp-1',
        treatmentPlan: { area: 'ORTOPEDICA' },
      },
    ] as never)

    mockPaymentAggregate.mockResolvedValue({ _sum: { amount: 100 } } as never)

    const result = await getFinanceSummaryUseCase({
      userId: 'u1',
      from: new Date('2026-04-01T00:00:00Z'),
      to: new Date('2026-04-30T23:59:59Z'),
      granularity: 'day',
    })

    expect(result.totalReceived).toBe('500.00')
    expect(result.totalForecast).toBe('330.00')
    expect(result.forecastBySource.perSession).toBe('180.00')
    expect(result.forecastBySource.packageInstallments).toBe('150.00')
    expect(result.delta.previousReceived).toBe('100.00')
    expect(result.delta.receivedVsPreviousPeriod).toBe('400.0')
    expect(result.byWorkplace.length).toBe(2)
    expect(result.byArea.length).toBe(2)
    expect(result.pendingPayments[0]).toMatchObject({
      patientName: 'Maria Silva',
      treatmentPlanId: 'plan-1',
      amount: '150.00',
    })
    expect(result.series.length).toBeGreaterThanOrEqual(29)
  })

  it('retorna zeros quando não há pagamentos nem sessões', async () => {
    mockPaymentFindMany.mockResolvedValue([] as never)
    mockSessionFindMany.mockResolvedValue([] as never)
    mockPaymentAggregate.mockResolvedValue({ _sum: { amount: null } } as never)

    const result = await getFinanceSummaryUseCase({
      userId: 'u1',
      from: new Date('2026-04-01T00:00:00Z'),
      to: new Date('2026-04-07T23:59:59Z'),
      granularity: 'day',
    })

    expect(result.totalReceived).toBe('0.00')
    expect(result.totalForecast).toBe('0.00')
    expect(result.delta.receivedVsPreviousPeriod).toBe('0.0')
    expect(result.pendingPayments).toEqual([])
  })
})
