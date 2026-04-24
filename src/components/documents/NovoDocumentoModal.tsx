'use client'

import { useState, useEffect, useRef } from 'react'
import { X, FilePlus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_OPTIONS = [
  { value: 'LAUDO_FISIOTERAPEUTICO', label: 'Laudo Fisioterapêutico' },
  { value: 'RELATORIO_PROGRESSO', label: 'Relatório de Progresso' },
  { value: 'DECLARACAO_COMPARECIMENTO', label: 'Declaração de Comparecimento' },
]

interface Patient {
  id: string
  name: string
  area: string
}

interface NovoDocumentoModalProps {
  onClose: () => void
  onCreated: () => void
}

export function NovoDocumentoModal({ onClose, onCreated }: NovoDocumentoModalProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientId, setPatientId] = useState('')
  const [type, setType] = useState('LAUDO_FISIOTERAPEUTICO')
  const [period, setPeriod] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [error, setError] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/patients?limit=200')
      .then((r) => r.json())
      .then((data) => setPatients(data.patients ?? []))
      .finally(() => setLoadingPatients(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!patientId) {
      setError('Selecione um paciente')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, type, period: period || undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message ?? 'Erro ao criar documento')
        return
      }

      const { document: doc } = await res.json()

      // Trigger download
      const dlRes = await fetch(`/api/documents/${doc.id}/download`)
      if (dlRes.ok) {
        const blob = await dlRes.blob()
        const url = URL.createObjectURL(blob)
        const a = window.document.createElement('a')
        a.href = url
        a.download = doc.title + '.pdf'
        window.document.body.appendChild(a)
        a.click()
        window.document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      onCreated()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-[24px] border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <FilePlus className="h-5 w-5 text-primary" />
            <p className="font-display text-[18px] font-bold text-foreground">Gerar documento</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="space-y-1.5">
            <label className="font-body text-[13px] font-semibold text-foreground">Paciente</label>
            {loadingPatients ? (
              <div className="flex h-9 items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-body text-[13px]">Carregando…</span>
              </div>
            ) : (
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 font-body text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">Selecione um paciente</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-body text-[13px] font-semibold text-foreground">
              Tipo de documento
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 font-body text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-body text-[13px] font-semibold text-foreground">
              Período{' '}
              <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="ex: 01/2026 – 04/2026"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 font-body text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-danger-soft px-3 py-2 font-body text-[12px] text-danger">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 font-body text-[13px] font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5',
                'bg-primary font-body text-[13px] font-semibold text-primary-foreground',
                'shadow-glow transition-colors hover:bg-primary-hover disabled:opacity-60'
              )}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Gerando…' : 'Gerar PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
