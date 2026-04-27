interface WeeklyChartProps {
  data: { day: string; count: number }[]
}

const BAR_H = 80
const BAR_W = 28
const GAP = 16
const LABEL_H = 24
const PAD_X = 16
const COUNT_H = 16

export function WeeklyChart({ data }: WeeklyChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1)
  const totalW = data.length * (BAR_W + GAP) - GAP + PAD_X * 2
  const totalH = COUNT_H + BAR_H + LABEL_H + 4

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <p className="font-body text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Últimos 7 dias
      </p>
      <p className="mt-1 font-display text-[20px] font-bold text-foreground">Evolução semanal</p>

      <div className="mt-6 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${totalW} ${totalH}`}
          width="100%"
          style={{ minWidth: totalW }}
          aria-label="Sessões realizadas por dia da semana"
        >
          {data.map((d, i) => {
            const barH = Math.max(
              d.count > 0 ? Math.round((d.count / max) * BAR_H) : 0,
              d.count > 0 ? 6 : 0
            )
            const x = PAD_X + i * (BAR_W + GAP)
            const barY = COUNT_H + BAR_H - barH

            return (
              <g key={`${d.day}-${i}`}>
                {/* track */}
                <rect
                  x={x}
                  y={COUNT_H}
                  width={BAR_W}
                  height={BAR_H}
                  rx={6}
                  className="fill-muted"
                />
                {/* fill */}
                {barH > 0 && (
                  <rect
                    x={x}
                    y={barY}
                    width={BAR_W}
                    height={barH}
                    rx={6}
                    className="fill-primary"
                  />
                )}
                {/* count */}
                {d.count > 0 && (
                  <text
                    x={x + BAR_W / 2}
                    y={COUNT_H - 4}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={600}
                    className="fill-primary-soft-fg font-body"
                  >
                    {d.count}
                  </text>
                )}
                {/* day label */}
                <text
                  x={x + BAR_W / 2}
                  y={COUNT_H + BAR_H + LABEL_H}
                  textAnchor="middle"
                  fontSize={11}
                  className="fill-muted-foreground font-body"
                >
                  {d.day}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
