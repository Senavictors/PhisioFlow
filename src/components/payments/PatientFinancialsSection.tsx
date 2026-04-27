'use client'

import { useEffect, useState } from 'react'
import { CircleDollarSign } from 'lucide-react'

interface PaymentItem {
  id: string
  amount: string | number
  method: string
  status: string
  paidAt: string
  notes?: string | null
  treatmentPlan?: { id: string } | null
  session?: { id: string; date: string } | null
}

interface PatientFinancials {
  totalPaid: number
  totalPending: number
  payments: PaymentItem[]
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

const STATUS_LABELS: Record<string, string> = {
  PAID: 'Pago',
  PENDING: 'Pendente',
  PARTIAL: 'Parcial',
  REFUNDED: 'Estornado',
}

function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function dateFmt(value: string) {
  return new Date(value).toLocaleDateString('pt-BR')
}

export function PatientFinancialsSection({ patientId }: { patientId: string }) {
  const [data, setData] = useState<PatientFinancials | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/patients/${patientId}/financials`)
      .then((r) => r.json())
      .then((payload) => setData(payload))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [patientId])

  return (
    <section className="space-y-4 rounded-[18px] border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <CircleDollarSign className="h-4 w-4 text-primary" />
        <h2 className="font-display text-[15px] font-bold text-foreground">Financeiro</h2>
      </div>

      {loading ? (
        <p className="font-body text-[12.5px] text-muted-foreground">Carregando...</p>
      ) : !data ? (
        <p className="font-body text-[12.5px] text-muted-foreground">Sem dados financeiros.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[16px] bg-success-soft px-4 py-3">
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-success">
                Recebido
              </p>
              <p className="mt-1 font-display text-[18px] font-bold text-success">
                {money(data.totalPaid)}
              </p>
            </div>
            <div className="rounded-[16px] bg-warning-soft px-4 py-3">
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.1em] text-warning">
                Em aberto
              </p>
              <p className="mt-1 font-display text-[18px] font-bold text-warning">
                {money(data.totalPending)}
              </p>
            </div>
          </div>

          {data.payments.length === 0 ? (
            <p className="font-body text-[12.5px] text-muted-foreground">
              Nenhum pagamento registrado para este paciente.
            </p>
          ) : (
            <div className="overflow-hidden rounded-[16px] border border-border">
              <table className="w-full text-left font-body text-[12.5px]">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Data</th>
                    <th className="px-3 py-2 font-semibold">Origem</th>
                    <th className="px-3 py-2 font-semibold">Método</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 text-right font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-3 py-2">{dateFmt(p.paidAt)}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {p.treatmentPlan ? 'Plano' : 'Sessão avulsa'}
                      </td>
                      <td className="px-3 py-2">{METHOD_LABELS[p.method] ?? p.method}</td>
                      <td className="px-3 py-2">{STATUS_LABELS[p.status] ?? p.status}</td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {money(Number(p.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  )
}
