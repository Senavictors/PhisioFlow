'use client'

import Link from 'next/link'
import { Phone, Calendar, ChevronRight } from 'lucide-react'
import { formatDateOnlyPtBr } from '@/lib/date'
import { cn } from '@/lib/utils'
import { formatTreatmentPlanLabel } from '@/lib/clinical-labels'

const CLASSIFICATION_LABELS: Record<string, string> = {
  ELDERLY: 'Idoso',
  PCD: 'PCD',
  POST_ACCIDENT: 'Pós-acidente',
  STANDARD: 'Padrão',
}

interface Patient {
  id: string
  name: string
  phone: string | null
  birthDate: Date | string | null
  classification: string
  treatmentPlans?: Array<{
    id: string
    area: string
    specialties: string[]
    status: string
  }>
}

export function PatientCard({ patient }: { patient: Patient }) {
  const birthDate = patient.birthDate ? formatDateOnlyPtBr(patient.birthDate) : null

  return (
    <Link
      href={`/pacientes/${patient.id}`}
      className={cn(
        'group block rounded-[18px] border border-border bg-card px-4 py-4 sm:px-5 sm:py-5',
        'hover:border-primary/40 hover:shadow-md transition-all duration-[180ms]'
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft">
            <span className="font-display text-[15px] font-bold text-primary">
              {patient.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="min-w-0">
            <p className="truncate font-body text-[15px] font-semibold text-foreground">
              {patient.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {birthDate && (
                <span className="flex items-center gap-1 font-body text-[12px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {birthDate}
                </span>
              )}
              {patient.phone && (
                <span className="flex items-center gap-1 font-body text-[12px] text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {patient.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          {(patient.treatmentPlans ?? []).slice(0, 2).map((plan) => (
            <span
              key={plan.id}
              className="rounded-full bg-primary-soft px-2.5 py-1 font-body text-[11px] font-semibold text-primary-soft-fg"
            >
              {formatTreatmentPlanLabel(plan)}
            </span>
          ))}
          {(patient.treatmentPlans ?? []).length === 0 ? (
            <span className="rounded-full bg-muted px-2.5 py-1 font-body text-[11px] font-semibold text-muted-foreground">
              Sem plano
            </span>
          ) : null}
          {patient.classification !== 'STANDARD' && (
            <span className="rounded-full bg-danger-soft px-2.5 py-1 font-body text-[11px] font-semibold text-danger">
              {CLASSIFICATION_LABELS[patient.classification] ?? patient.classification}
            </span>
          )}

          <span className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors duration-[180ms] group-hover:bg-primary-soft group-hover:text-primary lg:ml-0">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
