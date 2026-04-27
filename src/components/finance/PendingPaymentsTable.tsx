'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wallet } from 'lucide-react'
import { RegisterPaymentModal } from '@/components/payments/RegisterPaymentModal'

interface PendingPayment {
  id: string
  patientName: string
  planLabel: string | null
  amount: string
  dueAt: string | null
  method: string
  treatmentPlanId?: string | null
  patientId?: string | null
}

const METHOD_LABELS: Record<string, string> = {
  PIX: 'PIX',
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Crédito',
  DEBIT_CARD: 'Débito',
  BANK_TRANSFER: 'Transferência',
  INSURANCE: 'Convênio',
  OTHER: 'Outro',
}

function money(value: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value))
}

function dateLabel(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pt-BR')
}

export function PendingPaymentsTable({ items }: { items: PendingPayment[] }) {
  const router = useRouter()
  const [paying, setPaying] = useState<PendingPayment | null>(null)

  return (
    <section className="rounded-[18px] border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-[15px] font-bold text-foreground">Pagamentos pendentes</h3>
        <span className="rounded-full bg-warning-soft px-2.5 py-1 font-body text-[11px] font-semibold text-warning">
          {items.length} em aberto
        </span>
      </div>

      {items.length === 0 ? (
        <p className="font-body text-[12.5px] text-muted-foreground">
          Nenhum pagamento pendente — tudo em dia.
        </p>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-border">
          <table className="w-full text-left font-body text-[12.5px]">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">Paciente</th>
                <th className="px-3 py-2 font-semibold">Origem</th>
                <th className="px-3 py-2 font-semibold">Método</th>
                <th className="px-3 py-2 font-semibold">Vence em</th>
                <th className="px-3 py-2 text-right font-semibold">Valor</th>
                <th className="px-3 py-2 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-3 py-2 font-semibold text-foreground">
                    {item.patientId ? (
                      <Link
                        href={`/pacientes/${item.patientId}`}
                        className="hover:text-primary hover:underline"
                      >
                        {item.patientName}
                      </Link>
                    ) : (
                      item.patientName
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{item.planLabel ?? '—'}</td>
                  <td className="px-3 py-2">{METHOD_LABELS[item.method] ?? item.method}</td>
                  <td className="px-3 py-2">{dateLabel(item.dueAt)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{money(item.amount)}</td>
                  <td className="px-3 py-2 text-right">
                    {item.treatmentPlanId ? (
                      <button
                        type="button"
                        onClick={() => setPaying(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 font-body text-[11.5px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft"
                      >
                        <Wallet className="h-3 w-3" />
                        Marcar pago
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paying && paying.treatmentPlanId ? (
        <RegisterPaymentModal
          open
          target={{ kind: 'plan', planId: paying.treatmentPlanId }}
          defaultAmount={Number(paying.amount)}
          onClose={() => setPaying(null)}
          onSuccess={() => router.refresh()}
        />
      ) : null}
    </section>
  )
}
