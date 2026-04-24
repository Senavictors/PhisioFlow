'use client'

import Link from 'next/link'
import { Phone, Calendar, ChevronRight } from 'lucide-react'
import { formatDateOnlyPtBr } from '@/lib/date'
import { cn } from '@/lib/utils'

const AREA_LABELS: Record<string, string> = {
  PILATES: 'Pilates',
  MOTOR: 'Motora',
  AESTHETIC: 'Estética',
  HOME_CARE: 'Domiciliar',
}

const CLASSIFICATION_LABELS: Record<string, string> = {
  ELDERLY: 'Idoso',
  PCD: 'PCD',
  POST_ACCIDENT: 'Pós-acidente',
  STANDARD: 'Padrão',
}

const AREA_COLORS: Record<string, string> = {
  PILATES: 'bg-primary-soft text-primary-soft-fg',
  MOTOR: 'bg-accent-soft text-accent-soft-fg',
  AESTHETIC: 'bg-success-soft text-success',
  HOME_CARE: 'bg-warning-soft text-warning',
}

interface Patient {
  id: string
  name: string
  phone: string | null
  birthDate: Date | string | null
  classification: string
  area: string
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
          <span
            className={cn(
              'rounded-full px-2.5 py-1 font-body text-[11px] font-semibold',
              AREA_COLORS[patient.area] ?? 'bg-muted text-muted-foreground'
            )}
          >
            {AREA_LABELS[patient.area] ?? patient.area}
          </span>
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
