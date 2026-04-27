export type Granularity = 'day' | 'week' | 'month'

export interface FinanceSeriesPoint {
  bucket: string
  received: string
  forecast: string
}

export interface FinanceBreakdownByWorkplace {
  workplaceId: string
  name: string
  received: string
  forecast: string
}

export interface FinanceBreakdownByArea {
  area: string
  received: string
  forecast: string
}

export interface FinancePendingPayment {
  id: string
  patientId: string | null
  patientName: string
  treatmentPlanId: string | null
  planLabel: string | null
  amount: string
  dueAt: string | null
  method: string
}

export interface FinanceSummary {
  range: { from: string; to: string; granularity: Granularity }
  totalReceived: string
  totalForecast: string
  forecastBySource: { perSession: string; packageInstallments: string }
  delta: { receivedVsPreviousPeriod: string; previousReceived: string }
  series: FinanceSeriesPoint[]
  byWorkplace: FinanceBreakdownByWorkplace[]
  byArea: FinanceBreakdownByArea[]
  pendingPayments: FinancePendingPayment[]
}
