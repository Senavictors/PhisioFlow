import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, FilePlus2 } from 'lucide-react'
import { getSession } from '@/lib/session'
import { SessionForm } from '@/components/sessions/SessionForm'
import {
  getPatientUseCase,
  PatientNotFoundError,
} from '@/server/modules/patients/application/get-patient'

async function loadPatient(id: string, userId: string) {
  try {
    return await getPatientUseCase(id, userId)
  } catch (error) {
    if (error instanceof PatientNotFoundError) {
      return null
    }

    throw error
  }
}

export default async function NovaSessaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  const patient = await loadPatient(id, session.userId!)

  if (!patient) {
    notFound()
  }

  return (
    <div className="max-w-[1120px] space-y-6 sm:space-y-8">
      <div>
        <Link
          href={`/pacientes/${id}`}
          className="mb-4 flex items-center gap-1.5 font-body text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Voltar para ficha clínica
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Registro SOAP
            </p>
            <h1 className="font-display text-[30px] font-bold leading-tight text-foreground sm:text-[36px]">
              Novo atendimento
            </h1>
            <p className="mt-1 font-body text-[14px] text-muted-foreground">
              Registre a evolução clínica do paciente com padrão SOAP.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full bg-primary-soft px-3.5 py-2">
            <FilePlus2 className="h-4 w-4 text-primary" />
            <span className="font-body text-[12px] font-semibold text-primary-soft-fg">
              {patient.name}
            </span>
          </div>
        </div>
      </div>

      <SessionForm
        patient={{
          id: patient.id,
          name: patient.name,
          email: patient.email,
        }}
      />
    </div>
  )
}
