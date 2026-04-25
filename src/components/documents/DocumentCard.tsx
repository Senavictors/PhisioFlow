'use client'

import { useState } from 'react'
import { FileText, FilePlus, FileCheck, Download, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTreatmentPlanLabel } from '@/lib/clinical-labels'

const TYPE_LABELS: Record<string, string> = {
  LAUDO_FISIOTERAPEUTICO: 'Laudo Fisioterapêutico',
  RELATORIO_PROGRESSO: 'Relatório de Progresso',
  DECLARACAO_COMPARECIMENTO: 'Declaração de Comparecimento',
}

const TYPE_COLORS: Record<string, string> = {
  LAUDO_FISIOTERAPEUTICO: 'bg-primary-soft text-primary-soft-fg',
  RELATORIO_PROGRESSO: 'bg-accent-soft text-accent-soft-fg',
  DECLARACAO_COMPARECIMENTO: 'bg-success-soft text-success',
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  LAUDO_FISIOTERAPEUTICO: FileText,
  RELATORIO_PROGRESSO: FilePlus,
  DECLARACAO_COMPARECIMENTO: FileCheck,
}

interface DocumentCardProps {
  document: {
    id: string
    type: string
    title: string
    period: string | null
    createdAt: Date | string
    patient: {
      id: string
      name: string
      treatmentPlans?: Array<{ id: string; area: string; specialties: string[] }>
    }
  }
  onDelete: (id: string) => void
}

export function DocumentCard({ document: doc, onDelete }: DocumentCardProps) {
  const [downloading, setDownloading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const Icon = TYPE_ICONS[doc.type] ?? FileText
  const primaryPlan = doc.patient.treatmentPlans?.[0] ?? null
  const date = new Date(doc.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch(`/api/documents/${doc.id}/download`)
      if (!res.ok) throw new Error('Falha ao gerar PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = doc.title + '.pdf'
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' })
    onDelete(doc.id)
  }

  return (
    <div className="flex flex-col gap-4 rounded-[18px] border border-border bg-card px-4 py-4 sm:flex-row sm:items-center sm:px-5 sm:py-5">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-[15px] font-semibold text-foreground">
            {doc.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-body text-[12px] text-muted-foreground">{doc.patient.name}</span>
            <span className="font-body text-[12px] text-muted-foreground">·</span>
            <span className="font-body text-[12px] text-muted-foreground">
              {primaryPlan ? formatTreatmentPlanLabel(primaryPlan) : 'Sem plano'}
            </span>
            {doc.period && (
              <>
                <span className="font-body text-[12px] text-muted-foreground">·</span>
                <span className="font-body text-[12px] text-muted-foreground">{doc.period}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
        <span className="font-body text-[12px] text-muted-foreground">{date}</span>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 font-body text-[11px] font-semibold',
            TYPE_COLORS[doc.type] ?? 'bg-muted text-muted-foreground'
          )}
        >
          {TYPE_LABELS[doc.type] ?? doc.type}
        </span>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 font-body text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" />
          {downloading ? 'Gerando…' : 'Download'}
        </button>

        <button
          onClick={handleDelete}
          onBlur={() => setConfirming(false)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
            confirming
              ? 'bg-danger text-white hover:bg-danger/90'
              : 'bg-muted text-muted-foreground hover:bg-danger-soft hover:text-danger'
          )}
          title={confirming ? 'Clique para confirmar exclusão' : 'Excluir documento'}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
