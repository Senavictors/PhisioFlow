import { ClipboardList, FileText, ShieldCheck, Send } from 'lucide-react'

type DocumentTypeMeta = {
  key: string
  title: string
  description: string
  icon: typeof FileText
  status?: 'soon'
}

const DOCUMENT_TYPE_META: DocumentTypeMeta[] = [
  {
    key: 'RELATORIO_PROGRESSO',
    title: 'Relatório de evolução',
    description: 'Resumo clínico do progresso do paciente ao longo das sessões.',
    icon: ClipboardList,
  },
  {
    key: 'LAUDO_FISIOTERAPEUTICO',
    title: 'Laudo fisioterapêutico',
    description: 'Documento técnico com avaliação, diagnóstico e conduta proposta.',
    icon: FileText,
  },
  {
    key: 'ENCAMINHAMENTO',
    title: 'Encaminhamento',
    description: 'Indicação para outro profissional ou especialidade.',
    icon: Send,
    status: 'soon',
  },
  {
    key: 'DECLARACAO_COMPARECIMENTO',
    title: 'Declaração de horas',
    description: 'Comprovante de comparecimento e horas de atendimento.',
    icon: ShieldCheck,
  },
]

export function DocumentTypeCards() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {DOCUMENT_TYPE_META.map(({ key, title, description, icon: Icon, status }) => (
        <article
          key={key}
          className="flex flex-col gap-3 rounded-[20px] border border-border bg-card p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            {status === 'soon' ? (
              <span className="rounded-full bg-warning-soft px-2.5 py-1 font-body text-[10.5px] font-semibold uppercase tracking-wide text-warning">
                Em breve
              </span>
            ) : null}
          </div>
          <div>
            <p className="font-display text-[16px] font-bold leading-tight text-foreground">
              {title}
            </p>
            <p className="mt-1 font-body text-[12.5px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}
