import Link from 'next/link'
import { ArrowRight, Calendar, UserPlus } from 'lucide-react'

export function QuickActions() {
  return (
    <div className="flex flex-col rounded-2xl bg-primary p-6 shadow-glow">
      <p className="font-display text-[20px] font-bold text-primary-foreground">Ações rápidas</p>
      <p className="mt-1 font-body text-[12.5px] text-primary-foreground/80">
        Comece um fluxo em segundos.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/pacientes/new"
          className="flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/40 bg-primary-foreground/5 px-4 py-3 font-body text-[13px] font-semibold text-primary-foreground transition-colors duration-[180ms] hover:border-primary-foreground/70 hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
        >
          <UserPlus className="h-4 w-4 shrink-0" />
          Cadastrar paciente
        </Link>
        <Link
          href="/agenda"
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-body text-[13px] font-semibold text-accent-foreground shadow-sm transition-colors duration-[180ms] hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-foreground/60"
        >
          <Calendar className="h-4 w-4 shrink-0" />
          Agendar sessão
        </Link>
      </div>

      <div className="mt-auto pt-6">
        <Link
          href="/atendimentos"
          className="group flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-body text-[13px] font-semibold text-primary-foreground/85 transition-colors duration-[180ms] hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          Ver atendimentos
          <ArrowRight className="h-4 w-4 transition-transform duration-[180ms] group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
