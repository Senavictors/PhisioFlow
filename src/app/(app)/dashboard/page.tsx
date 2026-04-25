import { Users, CalendarCheck, TrendingUp } from 'lucide-react'
import { getSession } from '@/lib/session'
import { getDashboardMetrics } from '@/server/modules/dashboard/application/get-metrics'
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

export default async function DashboardPage() {
  const session = await getSession()
  const metrics = await getDashboardMetrics(session.userId!)

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
