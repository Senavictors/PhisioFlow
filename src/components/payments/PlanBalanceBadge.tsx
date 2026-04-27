'use client'

import { useEffect, useState } from 'react'
import { CircleDollarSign } from 'lucide-react'

interface PlanFinancials {
  totalDue: number
  totalPaid: number
  totalPending: number
  sessionsUsed: number
  sessionsRemaining: number | null
}

function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

interface PlanBalanceBadgeProps {
  planId: string
  pricingModel: string
  refreshKey?: number
}

export function PlanBalanceBadge({ planId, pricingModel, refreshKey }: PlanBalanceBadgeProps) {
  const [data, setData] = useState<PlanFinancials | null>(null)

  useEffect(() => {
    fetch(`/api/treatment-plans/${planId}/financials`)
      .then((r) => r.json())
      .then((payload) => {
        if (payload && typeof payload.totalDue === 'number') setData(payload)
      })
      .catch(() => undefined)
  }, [planId, refreshKey])

  if (!data) return null

  const summary =
    pricingModel === 'PACKAGE'
      ? `${money(data.totalPaid)} de ${money(data.totalDue)} pagos`
      : `Pago: ${money(data.totalPaid)} • Pendente: ${money(data.totalPending)}`

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft/60 px-2.5 py-1 font-body text-[11px] font-semibold text-primary-soft-fg">
      <CircleDollarSign className="h-3 w-3" />
      {summary}
    </span>
  )
}
