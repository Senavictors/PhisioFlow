'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarCheck2, CalendarPlus, CalendarX2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SyncSessionCalendarButtonProps {
  sessionId: string
  currentStatus?: string | null
}

export function SyncSessionCalendarButton({
  sessionId,
  currentStatus,
}: SyncSessionCalendarButtonProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [removing, setRemoving] = useState(false)

  const isSynced = currentStatus === 'SYNCED'
  const label =
    currentStatus === 'FAILED'
      ? 'Tentar novamente'
      : isSynced
        ? 'Atualizar agenda'
        : 'Sincronizar agenda'

  async function sync() {
    setError('')
    const response = await fetch(`/api/sessions/${sessionId}/calendar-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setError(data.message ?? 'Erro ao sincronizar')
      return
    }

    router.refresh()
  }

  async function remove() {
    setError('')
    setRemoving(true)
    const response = await fetch(`/api/sessions/${sessionId}/calendar-sync`, {
      method: 'DELETE',
    })
    setRemoving(false)

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setError(data.message ?? 'Erro ao remover evento')
      return
    }

    router.refresh()
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isPending || removing}
        onClick={() => startTransition(() => void sync())}
        className={cn(
          'flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5',
          'font-body text-[13px] font-semibold transition-colors duration-[180ms]',
          'border-primary/25 bg-primary-soft text-primary hover:border-primary/40 hover:bg-primary/10',
          'disabled:opacity-60'
        )}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSynced ? (
          <CalendarCheck2 className="h-4 w-4" />
        ) : (
          <CalendarPlus className="h-4 w-4" />
        )}
        {isPending ? 'Sincronizando...' : label}
      </button>

      {isSynced ? (
        <button
          type="button"
          disabled={isPending || removing}
          onClick={() => void remove()}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 font-body text-[12px] font-semibold text-muted-foreground transition-colors duration-[180ms] hover:bg-muted hover:text-foreground disabled:opacity-60"
        >
          {removing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CalendarX2 className="h-3.5 w-3.5" />
          )}
          Remover do Google
        </button>
      ) : null}

      {error ? <p className="font-body text-[12px] text-danger">{error}</p> : null}
    </div>
  )
}
