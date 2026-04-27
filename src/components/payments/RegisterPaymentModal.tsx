'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemedSelect } from '@/components/ui/themed-select'

const PAYMENT_METHOD_OPTIONS = [
  { value: 'PIX', label: 'PIX' },
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'CREDIT_CARD', label: 'Cartão de crédito' },
  { value: 'DEBIT_CARD', label: 'Cartão de débito' },
  { value: 'BANK_TRANSFER', label: 'Transferência' },
  { value: 'INSURANCE', label: 'Convênio' },
  { value: 'OTHER', label: 'Outro' },
]

const inputClass = cn(
  'w-full rounded-xl border border-border bg-input px-3.5 py-2.5',
  'font-body text-[14px] text-foreground placeholder:text-muted-foreground',
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring',
  'transition-colors duration-[180ms]'
)

interface RegisterPaymentModalProps {
  open: boolean
  onClose: () => void
  target: { kind: 'plan'; planId: string } | { kind: 'session'; sessionId: string }
  defaultAmount?: number
  onSuccess?: () => void
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function RegisterPaymentModal({
  open,
  onClose,
  target,
  defaultAmount,
  onSuccess,
}: RegisterPaymentModalProps) {
  if (!open) return null

  return (
    <ModalContent
      onClose={onClose}
      target={target}
      defaultAmount={defaultAmount}
      onSuccess={onSuccess}
    />
  )
}

function ModalContent({
  onClose,
  target,
  defaultAmount,
  onSuccess,
}: Omit<RegisterPaymentModalProps, 'open'>) {
  const router = useRouter()
  const [amount, setAmount] = useState(defaultAmount?.toString() ?? '')
  const [method, setMethod] = useState('PIX')
  const [paidAt, setPaidAt] = useState(todayISO())
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const url =
        target.kind === 'plan'
          ? `/api/treatment-plans/${target.planId}/payments`
          : `/api/sessions/${target.sessionId}/payments`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          method,
          paidAt: new Date(paidAt).toISOString(),
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.message ?? 'Falha ao registrar pagamento')
        return
      }

      onSuccess?.()
      onClose()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[20px] border border-border bg-card p-5 shadow-lg sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-display text-[20px] font-bold text-foreground">
              Registrar pagamento
            </h3>
            <p className="mt-1 font-body text-[12.5px] text-muted-foreground">
              {target.kind === 'plan'
                ? 'Pagamento será vinculado ao plano (pacote ou avulso).'
                : 'Pagamento será vinculado a esta sessão.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Valor (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={cn(inputClass, 'mt-1.5')}
            />
          </div>

          <div>
            <label className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Método *
            </label>
            <div className="mt-1.5">
              <ThemedSelect
                value={method}
                onChange={setMethod}
                options={PAYMENT_METHOD_OPTIONS}
                ariaLabel="Método de pagamento"
              />
            </div>
          </div>

          <div>
            <label className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Data do pagamento *
            </label>
            <input
              type="date"
              required
              value={paidAt}
              onChange={(event) => setPaidAt(event.target.value)}
              className={cn(inputClass, 'mt-1.5')}
            />
          </div>

          <div>
            <label className="font-body text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Observações
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={cn(inputClass, 'mt-1.5 min-h-[80px] resize-y')}
            />
          </div>

          {error ? (
            <p className="rounded-xl bg-danger-soft px-3 py-2 font-body text-[12.5px] text-danger">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 font-body text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="rounded-xl bg-primary px-5 py-2 font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Registrar pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
