import Link from 'next/link'
import { Calendar, UserPlus } from 'lucide-react'

export function QuickActions() {
  return (
    <div className="flex flex-col rounded-2xl bg-primary p-6 shadow-glow">
      <p className="font-display text-[20px] font-bold text-primary-foreground">Ações rápidas</p>
      <p className="mt-1 font-body text-[12.5px] text-primary-foreground/80">
        Comece um fluxo em segundos.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <Link
          href="/pacientes/new"
          className="flex items-center gap-3 rounded-xl px-4 py-3 font-body text-[13px] font-semibold text-primary-foreground/90 transition-colors duration-[180ms] hover:bg-white/10"
        >
          <UserPlus className="h-4 w-4 shrink-0" />
          Cadastrar paciente
        </Link>
        <Link
          href="/agenda"
          className="flex items-center gap-3 rounded-xl px-4 py-3 font-body text-[13px] font-semibold text-primary-foreground/90 transition-colors duration-[180ms] hover:bg-white/10"
        >
          <Calendar className="h-4 w-4 shrink-0" />
          Agendar sessão
        </Link>
      </div>

      <div className="mt-auto pt-6">
        <Link
          href="/atendimentos"
          className="font-body text-[13px] text-primary-foreground/80 transition-opacity duration-[180ms] hover:text-primary-foreground"
        >
          Ver atendimentos →
        </Link>
      </div>
    </div>
  )
}
