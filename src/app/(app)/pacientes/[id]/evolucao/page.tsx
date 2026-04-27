import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, FilePlus2 } from 'lucide-react'
import { getSession } from '@/lib/session'
import {
  getPatientUseCase,
  PatientNotFoundError,
} from '@/server/modules/patients/application/get-patient'
import { listSessionsUseCase } from '@/server/modules/sessions/application/list-sessions'
import { TimelineEntry } from '@/components/timeline/TimelineEntry'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}

const LIMIT = 20

export default async function EvolucaoPage({ params, searchParams }: Props) {
  const { id } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam ?? '1'))

  const session = await getSession()

  let patient
  try {
    patient = await getPatientUseCase(id, session.userId!)
  } catch (err) {
    if (err instanceof PatientNotFoundError) notFound()
    throw err
  }

  const { sessions, total } = await listSessionsUseCase(session.userId!, {
    patientId: id,
    page,
    limit: LIMIT,
    order: 'desc',
  })

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="max-w-[860px] space-y-6 sm:space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link
          href={`/pacientes/${id}`}
          className="flex items-center gap-1.5 font-body text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {patient.name}
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-body text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Histórico clínico
            </p>
            <h1 className="mt-1 font-display text-[32px] font-bold leading-tight text-foreground">
              Evolução de {patient.name.split(' ')[0]}
            </h1>
            <p className="mt-1 font-body text-[13px] text-muted-foreground">
              {total === 0
                ? 'Nenhuma sessão registrada ainda.'
                : `${total} ${total === 1 ? 'sessão registrada' : 'sessões registradas'}`}
            </p>
          </div>

          <Link
            href={`/pacientes/${id}/sessoes/nova`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover sm:w-auto"
          >
            <FilePlus2 className="h-4 w-4" />
            Nova sessão
          </Link>
        </div>
      </div>

      {/* Timeline */}
      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="font-body text-[14px] text-muted-foreground">
            Nenhuma sessão registrada para este paciente.
          </p>
          <Link
            href={`/pacientes/${id}/sessoes/nova`}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover"
          >
            <FilePlus2 className="h-4 w-4" />
            Registrar primeira sessão
          </Link>
        </div>
      ) : (
        <div className="relative">
          {sessions.map((s, i) => (
            <TimelineEntry
              key={s.id}
              session={s}
              isLast={i === sessions.length - 1 && page === totalPages}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="font-body text-[13px] text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/pacientes/${id}/evolucao?page=${page - 1}`}
                className="rounded-xl border border-border px-4 py-2 font-body text-[13px] font-semibold text-foreground transition-colors hover:bg-muted"
              >
                ← Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/pacientes/${id}/evolucao?page=${page + 1}`}
                className="rounded-xl bg-primary px-4 py-2 font-body text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Próxima →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
