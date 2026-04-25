import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ClipboardEdit } from 'lucide-react'
import { getSession } from '@/lib/session'
import { SessionForm } from '@/components/sessions/SessionForm'
import {
  getSessionUseCase,
  SessionNotFoundError,
} from '@/server/modules/sessions/application/get-session'

const AREA_LABELS: Record<string, string> = {
  PILATES: 'Pilates',
  MOTOR: 'Fisioterapia Motora',
  AESTHETIC: 'Fisioterapia Estética',
  HOME_CARE: 'Atendimento Domiciliar',
}

async function loadSession(id: string, userId: string) {
  try {
    return await getSessionUseCase(id, userId)
  } catch (error) {
    if (error instanceof SessionNotFoundError) {
      return null
    }
    throw error
  }
}

export default async function EditarAtendimentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  const clinicalSession = await loadSession(id, session.userId!)

  if (!clinicalSession) {
    notFound()
  }

  return (
    <div className="max-w-[1120px] space-y-6 sm:space-y-8">
      <div>
        <Link
          href="/atendimentos"
          className="mb-4 flex items-center gap-1.5 font-body text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Voltar para atendimentos
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Edição SOAP
            </p>
            <h1 className="font-display text-[30px] font-bold leading-tight text-foreground sm:text-[36px]">
              Editar atendimento
            </h1>
            <p className="mt-1 font-body text-[14px] text-muted-foreground">
              Ajuste data, status e o registro clínico do atendimento.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full bg-primary-soft px-3.5 py-2">
            <ClipboardEdit className="h-4 w-4 text-primary" />
            <span className="font-body text-[12px] font-semibold text-primary-soft-fg">
              {clinicalSession.patient.name} •{' '}
              {AREA_LABELS[clinicalSession.patient.area] ?? clinicalSession.patient.area}
            </span>
          </div>
        </div>
      </div>

      <SessionForm
        mode="edit"
        patient={{
          id: clinicalSession.patient.id,
          name: clinicalSession.patient.name,
          area: clinicalSession.patient.area,
        }}
        initialValues={{
          id: clinicalSession.id,
          date: clinicalSession.date,
          duration: clinicalSession.duration,
          type: clinicalSession.type,
          status: clinicalSession.status,
          subjective: clinicalSession.subjective,
          objective: clinicalSession.objective,
          assessment: clinicalSession.assessment,
          plan: clinicalSession.plan,
        }}
      />
    </div>
  )
}
