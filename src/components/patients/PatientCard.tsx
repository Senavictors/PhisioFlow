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
        'group flex items-center justify-between gap-4',
        'bg-card border border-border rounded-[14px] px-5 py-4',
        'hover:border-primary/40 hover:shadow-md transition-all duration-[180ms]'
      )}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
          <span className="font-display font-bold text-[15px] text-primary">
            {patient.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-body font-semibold text-[14px] text-foreground truncate">
            {patient.name}
          </p>
          <div className="flex items-center gap-3 mt-1">
            {birthDate && (
              <span className="flex items-center gap-1 font-body text-[12px] text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {birthDate}
              </span>
            )}
            {patient.phone && (
              <span className="flex items-center gap-1 font-body text-[12px] text-muted-foreground">
                <Phone className="w-3 h-3" />
                {patient.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className={cn(
            'px-2.5 py-1 rounded-full font-body text-[11px] font-semibold',
            AREA_COLORS[patient.area] ?? 'bg-muted text-muted-foreground'
          )}
        >
          {AREA_LABELS[patient.area] ?? patient.area}
        </span>
        {patient.classification !== 'STANDARD' && (
          <span className="px-2.5 py-1 rounded-full bg-danger-soft text-danger font-body text-[11px] font-semibold">
            {CLASSIFICATION_LABELS[patient.classification] ?? patient.classification}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  )
}
