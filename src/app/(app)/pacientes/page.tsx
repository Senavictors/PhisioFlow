import Link from 'next/link'
import { Suspense } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { getSession } from '@/lib/session'
import { listPatientsUseCase } from '@/server/modules/patients/application/list-patients'
import { PatientCard } from '@/components/patients/PatientCard'
import { PatientFilters } from '@/components/patients/PatientFilters'
import { listPatientsDTO } from '@/server/modules/patients/http/patient.dto'

interface SearchParams {
  area?: string
  classification?: string
  search?: string
}

async function PatientList({ searchParams }: { searchParams: SearchParams }) {
  const session = await getSession()
  const parsedFilters = listPatientsDTO.safeParse({
    area: searchParams.area || undefined,
    classification: searchParams.classification || undefined,
    search: searchParams.search || undefined,
  })

  const patients = await listPatientsUseCase(
    session.userId!,
    parsedFilters.success ? parsedFilters.data : {}
  )

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-display font-bold text-[18px] text-foreground">
            Nenhum paciente encontrado
          </p>
          <p className="font-body text-[13px] text-muted-foreground mt-1">
            Cadastre o primeiro paciente para começar.
          </p>
        </div>
        <Link
          href="/pacientes/new"
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-body text-[13px] font-semibold hover:bg-primary-hover transition-colors shadow-glow"
        >
          Novo paciente
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-[12px] text-muted-foreground mb-1">
        {patients.length} {patients.length === 1 ? 'paciente' : 'pacientes'}
      </p>
      {patients.map((patient) => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  )
}

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[32px] text-foreground leading-tight">
            Pacientes
          </h1>
          <p className="font-body text-[13px] text-muted-foreground mt-0.5">
            Gerencie os cadastros e prontuários
          </p>
        </div>
        <Link
          href="/pacientes/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-body text-[13px] font-semibold hover:bg-primary-hover transition-colors shadow-glow"
        >
          <UserPlus className="w-4 h-4" />
          Novo paciente
        </Link>
      </div>

      <Suspense>
        <PatientFilters />
      </Suspense>

      <Suspense
        fallback={
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[72px] rounded-[14px] bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        <PatientList searchParams={params} />
      </Suspense>
    </div>
  )
}
