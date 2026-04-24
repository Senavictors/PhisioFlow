import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PatientForm } from '@/components/patients/PatientForm'

export default function NovoPacientePage() {
  return (
    <div className="max-w-[1040px] space-y-6 sm:space-y-8">
      <div>
        <Link
          href="/pacientes"
          className="flex items-center gap-1.5 font-body text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Voltar para Pacientes
        </Link>
        <h1 className="font-display text-[30px] font-bold leading-tight text-foreground sm:text-[36px]">
          Novo Paciente
        </h1>
        <p className="mt-1 font-body text-[14px] text-muted-foreground">
          Preencha os dados para cadastrar um novo paciente.
        </p>
      </div>

      <PatientForm />
    </div>
  )
}
