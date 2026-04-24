import { AlertTriangle } from 'lucide-react'

export function AttentionAlert({ count }: { count: number }) {
  if (count === 0) return null

  return (
    <div className="rounded-2xl bg-accent-soft p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/60">
        <AlertTriangle className="h-5 w-5 text-accent-soft-fg" />
      </div>

      <p className="mt-4 font-body text-[15px] font-bold uppercase tracking-wide text-accent-soft-fg">
        Atenção
      </p>
      <p className="mt-1 font-display text-[52px] leading-none tracking-tight text-accent-soft-fg">
        {count}
      </p>
      <p className="mt-1 font-body text-[13px] text-accent-soft-fg/80">
        {count === 1 ? 'paciente sem atendimento' : 'pacientes sem atendimento'} há 30+ dias
      </p>
    </div>
  )
}
