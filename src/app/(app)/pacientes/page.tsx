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
      <div className="flex min-h-[360px] items-center justify-center rounded-[24px] border border-dashed border-border bg-card/75 px-6 py-12 sm:px-10 sm:py-16">
        <div className="flex max-w-[420px] flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-display text-[22px] font-bold text-foreground">
              Nenhum paciente encontrado
            </p>
            <p className="mt-1 font-body text-[14px] text-muted-foreground">
              Cadastre o primeiro paciente para começar ou ajuste os filtros da busca.
            </p>
          </div>
          <Link
            href="/pacientes/new"
            className="w-full rounded-xl bg-primary px-5 py-2.5 text-center font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover sm:w-auto"
          >
            Novo paciente
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="px-1 font-body text-[12px] text-muted-foreground">
        {patients.length} {patients.length === 1 ? 'paciente' : 'pacientes'}
      </p>
      <div className="space-y-3">
        {patients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
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
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            CRM Clínico
          </p>
          <h1 className="font-display text-[30px] font-bold leading-tight text-foreground sm:text-[36px]">
            Pacientes
          </h1>
          <p className="mt-1 font-body text-[14px] text-muted-foreground">
            Gerencie os cadastros e prontuários
          </p>
        </div>
        <Link
          href="/pacientes/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover sm:w-auto"
        >
          <UserPlus className="h-4 w-4" />
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
              <div key={i} className="h-[88px] animate-pulse rounded-[18px] bg-muted" />
            ))}
          </div>
        }
      >
        <PatientList searchParams={params} />
      </Suspense>
    </div>
  )
}
