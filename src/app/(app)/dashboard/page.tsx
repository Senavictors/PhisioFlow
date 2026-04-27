import Link from 'next/link'
import { Users, CalendarCheck, TrendingUp, CircleDollarSign, Clock3 } from 'lucide-react'
import { getSession } from '@/lib/session'
import { getDashboardMetrics } from '@/server/modules/dashboard/application/get-metrics'
import { getFinanceSummaryUseCase } from '@/server/modules/finance/application/get-finance-summary'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { WeeklyChart } from '@/components/dashboard/WeeklyChart'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentSessions } from '@/components/dashboard/RecentSessions'
import { AttentionAlert } from '@/components/dashboard/AttentionAlert'

const APP_TZ = 'America/Sao_Paulo'

function formatGreetingDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: APP_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

function moneyShort(value: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export default async function DashboardPage() {
  const session = await getSession()
  const metrics = await getDashboardMetrics(session.userId!)

  const today = new Date()
  const monthFrom = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthTo = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
  const finance = await getFinanceSummaryUseCase({
    userId: session.userId!,
    from: monthFrom,
    to: monthTo,
    granularity: 'day',
  })

  const firstName = session.name?.split(' ')[0] ?? 'bem-vindo'
  const dateLabel = formatGreetingDate(new Date())
  const capitalizedDate = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)

  return (
    <div className="space-y-8">
      {/* Saudação */}
      <div>
        <p className="font-body text-[13px] text-muted-foreground">{capitalizedDate}</p>
        <h1 className="mt-1 font-display text-[38px] font-bold leading-tight text-foreground">
          Olá, {firstName}
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          icon={Users}
          value={metrics.activePatients}
          label="Pacientes ativos"
          sub="cadastrados no sistema"
        />
        <KpiCard
          icon={CalendarCheck}
          value={metrics.sessionsToday}
          label="Atendimentos hoje"
          sub="sessões realizadas"
        />
        <KpiCard
          icon={TrendingUp}
          value={metrics.patientsWithoutReturn}
          label="Sem retorno"
          sub="há mais de 30 dias"
          variant="accent"
          urgent={metrics.patientsWithoutReturn > 0}
        />
      </div>

      {/* Mini-cards financeiros */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/financeiro?preset=month"
          className="group rounded-[18px] border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
        >
          <div className="flex items-center justify-between">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Caixa do mês
            </p>
            <CircleDollarSign className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 font-display text-[24px] font-bold text-foreground">
            {moneyShort(finance.totalReceived)}
          </p>
          <p className="mt-1 font-body text-[12px] text-muted-foreground group-hover:text-primary-soft-fg">
            recebido até hoje
          </p>
        </Link>
        <Link
          href="/financeiro?preset=month"
          className="group rounded-[18px] border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
        >
          <div className="flex items-center justify-between">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              A receber este mês
            </p>
            <Clock3 className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 font-display text-[24px] font-bold text-foreground">
            {moneyShort(finance.totalForecast)}
          </p>
          <p className="mt-1 font-body text-[12px] text-muted-foreground group-hover:text-primary-soft-fg">
            previsto em sessões e parcelas
          </p>
        </Link>
      </div>

      {/* Gráfico + Ações rápidas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <WeeklyChart data={metrics.weeklySessions} />
        <QuickActions />
      </div>

      {/* Atendimentos recentes + Alerta de atenção */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <RecentSessions sessions={metrics.recentSessions} />
        <AttentionAlert count={metrics.patientsWithoutReturn} />
      </div>
    </div>
  )
}
