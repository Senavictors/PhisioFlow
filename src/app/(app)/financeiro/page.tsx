import { CircleDollarSign } from 'lucide-react'
import { getSession } from '@/lib/session'
import { getFinanceSummaryUseCase } from '@/server/modules/finance/application/get-finance-summary'
import type { Granularity } from '@/server/modules/finance/domain/finance'
import { FinanceSummaryCard } from '@/components/finance/FinanceSummaryCard'
import { FinanceTimelineChart } from '@/components/finance/FinanceTimelineChart'
import { FinanceBreakdownPanel } from '@/components/finance/FinanceBreakdownPanel'
import { PendingPaymentsTable } from '@/components/finance/PendingPaymentsTable'
import { FinancePeriodPicker } from '@/components/finance/FinancePeriodPicker'

const AREA_LABELS: Record<string, string> = {
  ORTOPEDICA: 'Ortopédica',
  NEUROLOGICA: 'Neurológica',
  CARDIORESPIRATORIA: 'Cardiorrespiratória',
  ESTETICA: 'Estética',
  ESPORTIVA: 'Esportiva',
  PELVICA: 'Pélvica',
  PEDIATRICA: 'Pediátrica',
  GERIATRICA: 'Geriátrica',
  PREVENTIVA: 'Preventiva',
  OUTRA: 'Outra',
}

function money(value: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value))
}

function startOfDay(value: Date) {
  const next = new Date(value.getTime())
  next.setHours(0, 0, 0, 0)
  return next
}

function endOfDay(value: Date) {
  const next = new Date(value.getTime())
  next.setHours(23, 59, 59, 999)
  return next
}

function resolvePreset(preset: string): { from: Date; to: Date; label: string } {
  const today = new Date()
  if (preset === 'today') {
    return { from: startOfDay(today), to: endOfDay(today), label: 'Hoje' }
  }
  if (preset === '7d') {
    const from = new Date(today)
    from.setDate(today.getDate() - 6)
    return { from: startOfDay(from), to: endOfDay(today), label: 'Últimos 7 dias' }
  }
  if (preset === 'last-month') {
    const ref = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const from = new Date(ref.getFullYear(), ref.getMonth(), 1)
    const to = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999)
    return { from, to, label: 'Mês anterior' }
  }
  if (preset === 'month') {
    const from = new Date(today.getFullYear(), today.getMonth(), 1)
    return { from, to: endOfDay(today), label: 'Este mês' }
  }
  // default 30d
  const from = new Date(today)
  from.setDate(today.getDate() - 29)
  return { from: startOfDay(from), to: endOfDay(today), label: 'Últimos 30 dias' }
}

interface FinanceiroPageProps {
  searchParams: Promise<{ preset?: string; granularity?: string }>
}

export default async function FinanceiroPage({ searchParams }: FinanceiroPageProps) {
  const params = await searchParams
  const preset = params.preset ?? '30d'
  const granularityRaw = params.granularity ?? 'day'
  const granularity: Granularity =
    granularityRaw === 'week' || granularityRaw === 'month' ? granularityRaw : 'day'

  const { from, to, label } = resolvePreset(preset)
  const session = await getSession()
  const summary = await getFinanceSummaryUseCase({
    userId: session.userId!,
    from,
    to,
    granularity,
  })

  const deltaPct = Number(summary.delta.receivedVsPreviousPeriod)
  const deltaLabel = `${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}% vs período anterior`

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Caixa & Previsão
          </p>
          <h1 className="font-display text-[30px] font-bold leading-tight text-foreground sm:text-[36px]">
            Financeiro
          </h1>
          <p className="mt-1 font-body text-[14px] text-muted-foreground">
            {label} • recebido vs previsto, quebras por local e área e pendências.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full bg-primary-soft px-3.5 py-2">
          <CircleDollarSign className="h-4 w-4 text-primary" />
          <span className="font-body text-[12px] font-semibold text-primary-soft-fg">
            {money(summary.totalReceived)} no período
          </span>
        </div>
      </div>

      <FinancePeriodPicker preset={preset} granularity={granularity} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <FinanceSummaryCard
          label="Recebido no período"
          value={money(summary.totalReceived)}
          delta={deltaLabel}
          variant="received"
        />
        <FinanceSummaryCard
          label="Previsto no período"
          value={money(summary.totalForecast)}
          delta={`${money(summary.forecastBySource.perSession)} sessões + ${money(
            summary.forecastBySource.packageInstallments
          )} pacotes`}
          variant="forecast"
        />
        <FinanceSummaryCard
          label="Período anterior"
          value={money(summary.delta.previousReceived)}
          variant="received"
        />
      </div>

      <FinanceTimelineChart series={summary.series} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <FinanceBreakdownPanel
          title="Por local de trabalho"
          items={summary.byWorkplace.map((item) => ({
            label: item.name,
            received: item.received,
            forecast: item.forecast,
          }))}
        />
        <FinanceBreakdownPanel
          title="Por área"
          items={summary.byArea.map((item) => ({
            label: AREA_LABELS[item.area] ?? item.area,
            received: item.received,
            forecast: item.forecast,
          }))}
        />
      </div>

      <PendingPaymentsTable items={summary.pendingPayments} />
    </div>
  )
}
