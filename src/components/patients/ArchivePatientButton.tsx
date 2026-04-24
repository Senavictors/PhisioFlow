'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive } from 'lucide-react'

export function ArchivePatientButton({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [isArchiving, setIsArchiving] = useState(false)

  async function handleArchive() {
    const confirmed = window.confirm('Arquivar este paciente? O cadastro sairá da listagem ativa.')

    if (!confirmed) return

    setIsArchiving(true)

    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null
        window.alert(data?.message ?? 'Não foi possível arquivar o paciente.')
        return
      }

      router.push('/pacientes')
      router.refresh()
    } finally {
      setIsArchiving(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleArchive}
      disabled={isArchiving}
      className="inline-flex items-center gap-2 rounded-xl border border-danger/20 bg-danger-soft px-4 py-2.5 font-body text-[13px] font-semibold text-danger transition-colors hover:border-danger/30 hover:bg-danger-soft/80 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Archive className="h-4 w-4" />
      {isArchiving ? 'Arquivando...' : 'Arquivar paciente'}
    </button>
  )
}
