interface SeriesPoint {
  bucket: string
  received: string
  forecast: string
}

interface FinanceTimelineChartProps {
  series: SeriesPoint[]
}

function moneyShort(value: number) {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`
  return `R$ ${value.toFixed(0)}`
}

function dayLabel(bucket: string) {
  const [, m, d] = bucket.split('-')
  return `${d}/${m}`
}

export function FinanceTimelineChart({ series }: FinanceTimelineChartProps) {
  if (series.length === 0) {
    return (
      <div className="rounded-[18px] border border-border bg-card p-6 text-center">
        <p className="font-body text-[13px] text-muted-foreground">
          Sem dados no período selecionado.
        </p>
      </div>
    )
  }

  const width = 720
  const height = 240
  const padX = 40
  const padY = 24

  const max = Math.max(...series.map((p) => Math.max(Number(p.received), Number(p.forecast))), 1)
  const stepX = series.length > 1 ? (width - padX * 2) / (series.length - 1) : 0

  const toY = (value: number) => height - padY - ((height - padY * 2) * value) / max

  const buildPath = (key: 'received' | 'forecast') =>
    series
      .map((point, index) => {
        const x = padX + index * stepX
        const y = toY(Number(point[key]))
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
      })
      .join(' ')

  const receivedPath = buildPath('received')
  const forecastPath = buildPath('forecast')

  return (
    <div className="rounded-[18px] border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-[15px] font-bold text-foreground">Recebido vs Previsto</h3>
        <div className="flex items-center gap-3 font-body text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
            Recebido
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
            Previsto
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          preserveAspectRatio="none"
          style={{ minWidth: 480 }}
        >
          {[0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={padX}
              x2={width - padX}
              y1={toY(max * ratio)}
              y2={toY(max * ratio)}
              stroke="var(--color-border)"
              strokeWidth={1}
              strokeDasharray="3 4"
            />
          ))}

          <path
            d={forecastPath}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <path
            d={receivedPath}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />

          {series.map((point, index) => {
            const x = padX + index * stepX
            return (
              <g key={point.bucket}>
                <circle cx={x} cy={toY(Number(point.received))} r={3} fill="var(--color-primary)" />
                <circle cx={x} cy={toY(Number(point.forecast))} r={3} fill="var(--color-accent)" />
                {index % Math.max(1, Math.floor(series.length / 8)) === 0 ? (
                  <text
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--color-muted-foreground)"
                  >
                    {dayLabel(point.bucket)}
                  </text>
                ) : null}
              </g>
            )
          })}

          <text
            x={padX - 6}
            y={toY(max)}
            textAnchor="end"
            fontSize="10"
            fill="var(--color-muted-foreground)"
          >
            {moneyShort(max)}
          </text>
          <text
            x={padX - 6}
            y={toY(0) + 3}
            textAnchor="end"
            fontSize="10"
            fill="var(--color-muted-foreground)"
          >
            R$ 0
          </text>
        </svg>
      </div>
    </div>
  )
}
