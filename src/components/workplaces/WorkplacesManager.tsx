'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { WorkplaceCard } from './WorkplaceCard'
import { WorkplaceForm, type WorkplaceFormInitialValues } from './WorkplaceForm'

type WorkplaceKind = 'OWN_CLINIC' | 'PARTNER_CLINIC' | 'PARTICULAR' | 'ONLINE'
type AttendanceType = 'CLINIC' | 'HOME_CARE' | 'HOSPITAL' | 'CORPORATE' | 'ONLINE'

interface Workplace {
  id: string
  name: string
  kind: WorkplaceKind
  defaultAttendanceType: AttendanceType
  address?: string | null
  notes?: string | null
  isActive: boolean
}

interface WorkplacesManagerProps {
  initialWorkplaces: Workplace[]
}

export function WorkplacesManager({ initialWorkplaces }: WorkplacesManagerProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editingWorkplace = editingId ? initialWorkplaces.find((w) => w.id === editingId) : undefined

  function handleEdit(id: string) {
    setEditingId(id)
    setShowForm(false)
  }

  function handleSuccess() {
    setShowForm(false)
    setEditingId(null)
    router.refresh()
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
  }

  const editInitialValues: WorkplaceFormInitialValues | undefined = editingWorkplace
    ? {
        id: editingWorkplace.id,
        name: editingWorkplace.name,
        kind: editingWorkplace.kind,
        defaultAttendanceType: editingWorkplace.defaultAttendanceType,
        address: editingWorkplace.address,
        notes: editingWorkplace.notes,
      }
    : undefined

  return (
    <div className="space-y-5">
      {editingId && editInitialValues ? (
        <section className="rounded-[18px] border border-border bg-card p-5 sm:p-6">
          <h2 className="mb-5 font-display text-[18px] font-bold text-foreground">Editar local</h2>
          <WorkplaceForm
            mode="edit"
            initialValues={editInitialValues}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </section>
      ) : showForm ? (
        <section className="rounded-[18px] border border-border bg-card p-5 sm:p-6">
          <h2 className="mb-5 font-display text-[18px] font-bold text-foreground">
            Adicionar local de trabalho
          </h2>
          <WorkplaceForm mode="create" onSuccess={handleSuccess} onCancel={handleCancel} />
        </section>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Adicionar local
          </button>
        </div>
      )}

      {initialWorkplaces.length === 0 && !showForm && !editingId ? (
        <div className="rounded-[18px] border border-dashed border-border px-6 py-12 text-center">
          <p className="font-body text-[14px] text-muted-foreground">
            Nenhum local cadastrado ainda. Adicione seu primeiro local de trabalho.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {initialWorkplaces.map((workplace) => (
            <WorkplaceCard key={workplace.id} workplace={workplace} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </div>
  )
}
