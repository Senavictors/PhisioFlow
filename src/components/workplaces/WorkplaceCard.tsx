'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, Building2, Home, Globe, MapPin, Pencil, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'

type WorkplaceKind = 'OWN_CLINIC' | 'PARTNER_CLINIC' | 'PARTICULAR' | 'ONLINE'
type AttendanceType = 'CLINIC' | 'HOME_CARE' | 'HOSPITAL' | 'CORPORATE' | 'ONLINE'

const KIND_LABELS: Record<WorkplaceKind, string> = {
  OWN_CLINIC: 'Própria clínica',
  PARTNER_CLINIC: 'Clínica parceira',
  PARTICULAR: 'Particular',
  ONLINE: 'Online',
}

const ATTENDANCE_LABELS: Record<AttendanceType, string> = {
  CLINIC: 'Clínica',
  HOME_CARE: 'Domiciliar',
  HOSPITAL: 'Hospital',
  CORPORATE: 'Corporativo',
  ONLINE: 'Online',
}

function KindIcon({ kind }: { kind: WorkplaceKind }) {
  if (kind === 'ONLINE') return <Globe className="h-4 w-4" />
  if (kind === 'PARTICULAR') return <Home className="h-4 w-4" />
  return <Building2 className="h-4 w-4" />
}

interface WorkplaceCardProps {
  workplace: {
    id: string
    name: string
    kind: WorkplaceKind
    defaultAttendanceType: AttendanceType
    address?: string | null
    notes?: string | null
    isActive: boolean
  }
  onEdit: (id: string) => void
}

export function WorkplaceCard({ workplace, onEdit }: WorkplaceCardProps) {
  const router = useRouter()
  const [archiving, setArchiving] = useState(false)

  async function handleArchive() {
    if (!confirm(`Arquivar "${workplace.name}"? Ele não aparecerá em novos atendimentos.`)) return
    setArchiving(true)
    try {
      await fetch(`/api/workplaces/${workplace.id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setArchiving(false)
    }
  }

  return (
    <article
      className={cn(
        'rounded-[20px] border border-border bg-card p-5 shadow-sm',
        !workplace.isActive && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <KindIcon kind={workplace.kind} />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="font-display text-[17px] font-bold leading-tight text-foreground">
              {workplace.name}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary-soft px-2.5 py-0.5 font-body text-[11px] font-semibold text-primary-soft-fg">
                {KIND_LABELS[workplace.kind]}
              </span>
              <span className="flex items-center gap-1 font-body text-[12px] text-muted-foreground">
                <Stethoscope className="h-3.5 w-3.5" />
                {ATTENDANCE_LABELS[workplace.defaultAttendanceType]}
              </span>
            </div>
            {workplace.address ? (
              <p className="flex items-center gap-1.5 font-body text-[12px] text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {workplace.address}
              </p>
            ) : null}
            {workplace.notes ? (
              <p className="font-body text-[12px] italic text-muted-foreground">{workplace.notes}</p>
            ) : null}
          </div>
        </div>

        {workplace.isActive ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(workplace.id)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
              aria-label="Editar local"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleArchive}
              disabled={archiving}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-danger/40 hover:bg-danger-soft hover:text-danger disabled:opacity-50"
              aria-label="Arquivar local"
            >
              <Archive className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 font-body text-[11px] font-semibold text-muted-foreground">
            Arquivado
          </span>
        )}
      </div>
    </article>
  )
}
