interface BreakdownItem {
  label: string
  received: string
  forecast: string
}

interface FinanceBreakdownPanelProps {
  title: string
  items: BreakdownItem[]
  emptyLabel?: string
}

function money(value: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value))
}

export function FinanceBreakdownPanel({
  title,
  items,
  emptyLabel = 'Sem dados no período.',
}: FinanceBreakdownPanelProps) {
  const max = Math.max(...items.map((item) => Number(item.received) + Number(item.forecast)), 1)

  return (
    <section className="rounded-[18px] border border-border bg-card p-4 shadow-sm sm:p-5">
      <h3 className="font-display text-[15px] font-bold text-foreground">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 font-body text-[12.5px] text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => {
            const total = Number(item.received) + Number(item.forecast)
            const widthPct = (total / max) * 100
            const receivedPct = total > 0 ? (Number(item.received) / total) * 100 : 0
            return (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 font-body text-[12.5px]">
                  <span className="font-semibold text-foreground">{item.label}</span>
                  <span className="text-muted-foreground">
                    {money(item.received)}{' '}
                    <span className="opacity-60">+ {money(item.forecast)}</span>
                  </span>
                </div>
                <div
                  className="relative h-2 rounded-full bg-muted"
                  style={{ width: `${Math.max(widthPct, 4)}%` }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-primary)]"
                    style={{ width: `${receivedPct}%` }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 rounded-full bg-[var(--color-accent)]"
                    style={{ width: `${100 - receivedPct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
