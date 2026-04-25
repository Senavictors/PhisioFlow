import { getSession } from '@/lib/session'
import { listWorkplacesUseCase } from '@/server/modules/workplaces/application/list-workplaces'
import { WorkplacesManager } from '@/components/workplaces/WorkplacesManager'

export default async function LocaisPage() {
  const session = await getSession()
  const { workplaces } = await listWorkplacesUseCase(session.userId!, { includeArchived: false })

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          CONFIGURAÇÕES
        </p>
        <h1 className="font-display text-[30px] font-bold leading-tight text-foreground sm:text-[36px]">
          Locais de trabalho
        </h1>
        <p className="mt-2 font-body text-[14px] text-muted-foreground">
          Gerencie os locais onde você atende. Cada atendimento pode ser vinculado a um local
          específico.
        </p>
      </div>

      <WorkplacesManager initialWorkplaces={workplaces} />
    </div>
  )
}
