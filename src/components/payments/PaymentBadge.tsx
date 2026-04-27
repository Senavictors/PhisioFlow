import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  PAID: 'Pago',
  PENDING: 'Pendente',
  PARTIAL: 'Parcial',
  REFUNDED: 'Estornado',
}

const STATUS_CLASSES: Record<string, string> = {
  PAID: 'bg-success-soft text-success',
  PENDING: 'bg-warning-soft text-warning',
  PARTIAL: 'bg-muted text-muted-foreground',
  REFUNDED: 'bg-danger-soft text-danger',
}

interface PaymentBadgeProps {
  status?: string | null
  className?: string
}

export function PaymentBadge({ status, className }: PaymentBadgeProps) {
  if (!status) return null
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 font-body text-[11px] font-semibold',
        STATUS_CLASSES[status] ?? 'bg-muted text-muted-foreground',
        className
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
