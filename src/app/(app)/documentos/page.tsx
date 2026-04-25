'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { FileText, FilePlus } from 'lucide-react'
import { DocumentCard } from '@/components/documents/DocumentCard'
import { DocumentFilters } from '@/components/documents/DocumentFilters'
import { DocumentTypeCards } from '@/components/documents/DocumentTypeCards'
import { NovoDocumentoModal } from '@/components/documents/NovoDocumentoModal'

interface Document {
  id: string
  type: string
  title: string
  period: string | null
  createdAt: string
  patient: {
    id: string
    name: string
    area: string
  }
}

function DocumentList() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') ?? undefined

  const [documents, setDocuments] = useState<Document[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function loadDocuments() {
      const params = new URLSearchParams()
      if (type) params.set('type', type)
      const res = await fetch(`/api/documents?${params.toString()}`)

      if (ignore) return

      if (res.ok) {
        const data = await res.json()
        setDocuments(data.documents ?? [])
        setTotal(data.total ?? 0)
      }

      setLoading(false)
    }

    void loadDocuments()

    return () => {
      ignore = true
    }
  }, [type])

  function handleDelete(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    setTotal((prev) => prev - 1)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[80px] animate-pulse rounded-[18px] bg-muted" />
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-[24px] border border-dashed border-border bg-card/75 px-6 py-12 sm:px-10 sm:py-16">
        <div className="flex max-w-[420px] flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-display text-[22px] font-bold text-foreground">
              Nenhum documento gerado
            </p>
            <p className="mt-1 font-body text-[14px] text-muted-foreground">
              Gere o primeiro documento clínico para o paciente.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="px-1 font-body text-[12px] text-muted-foreground">
        {total} {total === 1 ? 'documento' : 'documentos'}
      </p>
      <div className="space-y-3">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  )
}

export default function DocumentosPage() {
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            CENTRAL
          </p>
          <h1 className="font-display text-[30px] font-bold leading-tight text-foreground sm:text-[36px]">
            Documentos
          </h1>
          <p className="mt-1 font-body text-[14px] text-muted-foreground">
            Laudos, relatórios e declarações.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-body text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover sm:w-auto"
        >
          <FilePlus className="h-4 w-4" />
          Novo documento
        </button>
      </div>

      <DocumentTypeCards />

      <Suspense>
        <DocumentFilters />
      </Suspense>

      <Suspense
        key={refreshKey}
        fallback={
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[80px] animate-pulse rounded-[18px] bg-muted" />
            ))}
          </div>
        }
      >
        <DocumentList />
      </Suspense>

      {showModal && (
        <NovoDocumentoModal
          onClose={() => setShowModal(false)}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  )
}
