import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PatientForm } from '@/components/patients/PatientForm'

export default function NovoPacientePage() {
  return (
    <div className="space-y-7 max-w-[720px]">
      <div>
        <Link
          href="/pacientes"
          className="flex items-center gap-1.5 font-body text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Voltar para Pacientes
        </Link>
        <h1 className="font-display font-bold text-[32px] text-foreground leading-tight">
          Novo Paciente
        </h1>
        <p className="font-body text-[13px] text-muted-foreground mt-0.5">
          Preencha os dados para cadastrar um novo paciente.
        </p>
      </div>

      <PatientForm />
    </div>
  )
}
