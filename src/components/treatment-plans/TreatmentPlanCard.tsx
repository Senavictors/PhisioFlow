'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  Pause,
  Pencil,
  Play,
  Stethoscope,
  Wallet,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ATTENDANCE_TYPE_LABELS,
  PLAN_STATUS_LABELS,
  PRICING_MODEL_LABELS,
  formatSpecialties,
  formatTreatmentPlanLabel,
} from '@/lib/clinical-labels'
import { PlanBalanceBadge } from '@/components/payments/PlanBalanceBadge'
import { RegisterPaymentModal } from '@/components/payments/RegisterPaymentModal'

export interface TreatmentPlanCardData {
  id: string
  patientId?: string
  area: string
  specialties: string[]
  attendanceType: string
  pricingModel: string
  status: string
  sessionPrice?: unknown
  packageAmount?: unknown
  totalSessions?: number | null
  notes?: string | null
  workplace?: { id: string; name: string } | null
  _count?: { sessions: number }
}

interface TreatmentPlanCardProps {
  plan: TreatmentPlanCardData
  patientId: string
  showActions?: boolean
}

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: 'bg-primary-soft text-primary-soft-fg',
  PAUSED: 'bg-warning-soft text-warning',
  COMPLETED: 'bg-success-soft text-success',
  CANCELED: 'bg-danger-soft text-danger',
}

function money(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const numberValue = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numberValue)) return null
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue)
}

export function TreatmentPlanCard({ plan, patientId, showActions = true }: TreatmentPlanCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [balanceKey, setBalanceKey] = useState(0)
  const specialtyText = formatSpecialties(plan.specialties)
  const sessionCount = plan._count?.sessions ?? 0
  const canRegisterPayment = plan.status === 'ACTIVE' || plan.status === 'PAUSED'

  async function mutate(action: 'pause' | 'resume' | 'complete' | 'cancel') {
    setBusyAction(action)
    const url =
      action === 'cancel'
        ? `/api/treatment-plans/${plan.id}`
        : `/api/treatment-plans/${plan.id}/${action}`
    const method = action === 'cancel' ? 'DELETE' : 'POST'

    try {
      const response = await fetch(url, { method })
      if (response.ok) {
        startTransition(() => router.refresh())
      }
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <article className="rounded-[18px] border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-soft px-2.5 py-1 font-body text-[11px] font-semibold text-primary-soft-fg">
              {formatTreatmentPlanLabel(plan)}
            </span>
            <span
              className={cn(
                'rounded-full px-2.5 py-1 font-body text-[11px] font-semibold',
                STATUS_CLASSES[plan.status] ?? 'bg-muted text-muted-foreground'
              )}
            >
              {PLAN_STATUS_LABELS[plan.status] ?? plan.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 font-body text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5" />
              {ATTENDANCE_TYPE_LABELS[plan.attendanceType] ?? plan.attendanceType}
            </span>
            {plan.workplace ? (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {plan.workplace.name}
              </span>
            ) : null}
            <span className="flex items-center gap-1.5">
              <CircleDollarSign className="h-3.5 w-3.5" />
              {PRICING_MODEL_LABELS[plan.pricingModel] ?? plan.pricingModel}
              {plan.pricingModel === 'PER_SESSION' && money(plan.sessionPrice)
                ? ` (${money(plan.sessionPrice)})`
                : null}
              {plan.pricingModel === 'PACKAGE' && money(plan.packageAmount)
                ? ` (${money(plan.packageAmount)})`
                : null}
            </span>
          </div>

          <PlanBalanceBadge
            planId={plan.id}
            pricingModel={plan.pricingModel}
            refreshKey={balanceKey}
          />

          {plan.pricingModel === 'PACKAGE' ? (
            <p className="font-body text-[12.5px] font-semibold text-foreground">
              {sessionCount} de {plan.totalSessions ?? 0} sessoes
            </p>
          ) : (
            <p className="font-body text-[12.5px] font-semibold text-foreground">
              {sessionCount} {sessionCount === 1 ? 'sessao vinculada' : 'sessoes vinculadas'}
            </p>
          )}

          {specialtyText ? (
            <p className="font-body text-[12.5px] text-muted-foreground">{specialtyText}</p>
          ) : null}

          {plan.notes ? (
            <p className="max-w-[680px] font-body text-[13px] leading-relaxed text-muted-foreground">
              {plan.notes}
            </p>
          ) : null}
        </div>

        {showActions ? (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Link
              href={`/pacientes/${patientId}/planos/${plan.id}/editar`}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 font-body text-[12px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Link>

            {canRegisterPayment ? (
              <button
                type="button"
                onClick={() => setPaymentOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 font-body text-[12px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft"
              >
                <Wallet className="h-3.5 w-3.5" />
                Registrar pagamento
              </button>
            ) : null}

            {plan.status === 'ACTIVE' ? (
              <button
                type="button"
                disabled={isPending || busyAction === 'pause'}
                onClick={() => mutate('pause')}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 font-body text-[12px] font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                <Pause className="h-3.5 w-3.5" />
                Pausar
              </button>
            ) : null}

            {plan.status === 'PAUSED' ? (
              <button
                type="button"
                disabled={isPending || busyAction === 'resume'}
                onClick={() => mutate('resume')}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 font-body text-[12px] font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                <Play className="h-3.5 w-3.5" />
                Retomar
              </button>
            ) : null}

            {plan.status !== 'COMPLETED' && plan.status !== 'CANCELED' ? (
              <button
                type="button"
                disabled={isPending || busyAction === 'complete'}
                onClick={() => mutate('complete')}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 font-body text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Concluir
              </button>
            ) : null}

            {plan.status !== 'CANCELED' ? (
              <button
                type="button"
                disabled={isPending || busyAction === 'cancel'}
                onClick={() => mutate('cancel')}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-danger-soft px-3 font-body text-[12px] font-semibold text-danger transition-colors hover:bg-danger-soft/80 disabled:opacity-60"
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancelar
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <RegisterPaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        target={{ kind: 'plan', planId: plan.id }}
        defaultAmount={
          plan.pricingModel === 'PACKAGE'
            ? plan.packageAmount != null
              ? Number(plan.packageAmount)
              : undefined
            : plan.sessionPrice != null
              ? Number(plan.sessionPrice)
              : undefined
        }
        onSuccess={() => setBalanceKey((value) => value + 1)}
      />
    </article>
  )
}
