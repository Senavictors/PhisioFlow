import { beforeEach, describe, expect, it, vi } from 'vitest'
import { findSessionById } from '@/server/modules/sessions/infra/session.repository'
import { findTreatmentPlanById } from '@/server/modules/treatment-plans/infra/treatment-plan.repository'
import { TreatmentPlanNotFoundError } from '@/server/modules/treatment-plans/domain/treatment-plan'
import { SessionNotFoundError } from '@/server/modules/sessions/application/get-session'
import { InvalidPaymentTargetError, SessionCoveredByPackageError } from '../domain/payment'
import { createPayment } from '../infra/payment.repository'
import { registerPaymentUseCase } from './register-payment'
import { recomputeSessionPaymentStatus } from './recompute-session-payment-status'

vi.mock('@/server/modules/sessions/infra/session.repository')
vi.mock('@/server/modules/treatment-plans/infra/treatment-plan.repository')
vi.mock('../infra/payment.repository')
vi.mock('./recompute-session-payment-status')

const mockFindSession = vi.mocked(findSessionById)
const mockFindPlan = vi.mocked(findTreatmentPlanById)
const mockCreatePayment = vi.mocked(createPayment)
const mockRecompute = vi.mocked(recomputeSessionPaymentStatus)

const baseDto = {
  amount: 200,
  method: 'PIX' as const,
  paidAt: '2026-04-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockCreatePayment.mockResolvedValue({ id: 'pay-1' } as never)
  mockRecompute.mockResolvedValue(undefined)
})

describe('registerPaymentUseCase', () => {
  it('exige exatamente um alvo (sessão xor plano)', async () => {
    await expect(registerPaymentUseCase({ userId: 'u1', dto: baseDto })).rejects.toBeInstanceOf(
      InvalidPaymentTargetError
    )

    await expect(
      registerPaymentUseCase({
        userId: 'u1',
        dto: baseDto,
        sessionId: 's1',
        treatmentPlanId: 'p1',
      })
    ).rejects.toBeInstanceOf(InvalidPaymentTargetError)
  })

  it('rejeita sessão coberta por pacote', async () => {
    mockFindSession.mockResolvedValue({
      id: 's1',
      treatmentPlan: { pricingModel: 'PACKAGE' },
    } as never)

    await expect(
      registerPaymentUseCase({ userId: 'u1', dto: baseDto, sessionId: 's1' })
    ).rejects.toBeInstanceOf(SessionCoveredByPackageError)
  })

  it('rejeita plano não encontrado', async () => {
    mockFindPlan.mockResolvedValue(null)

    await expect(
      registerPaymentUseCase({ userId: 'u1', dto: baseDto, treatmentPlanId: 'p1' })
    ).rejects.toBeInstanceOf(TreatmentPlanNotFoundError)
  })

  it('rejeita sessão não encontrada', async () => {
    mockFindSession.mockResolvedValue(null)

    await expect(
      registerPaymentUseCase({ userId: 'u1', dto: baseDto, sessionId: 's-x' })
    ).rejects.toBeInstanceOf(SessionNotFoundError)
  })

  it('cria pagamento avulso e recalcula status da sessão', async () => {
    mockFindSession.mockResolvedValue({
      id: 's1',
      treatmentPlan: null,
    } as never)

    await registerPaymentUseCase({ userId: 'u1', dto: baseDto, sessionId: 's1' })

    expect(mockCreatePayment).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', sessionId: 's1', amount: 200, status: 'PAID' })
    )
    expect(mockRecompute).toHaveBeenCalledWith('s1')
  })

  it('cria pagamento de plano sem recalcular sessão', async () => {
    mockFindPlan.mockResolvedValue({ id: 'p1' } as never)

    await registerPaymentUseCase({ userId: 'u1', dto: baseDto, treatmentPlanId: 'p1' })

    expect(mockCreatePayment).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', treatmentPlanId: 'p1' })
    )
    expect(mockRecompute).not.toHaveBeenCalled()
  })
})
