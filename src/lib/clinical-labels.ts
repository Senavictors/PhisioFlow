export const THERAPY_AREA_LABELS: Record<string, string> = {
  ORTOPEDICA: 'Ortopedica',
  NEUROLOGICA: 'Neurologica',
  CARDIORESPIRATORIA: 'Cardiorrespiratoria',
  ESTETICA: 'Estetica',
  ESPORTIVA: 'Esportiva',
  PELVICA: 'Pelvica',
  PEDIATRICA: 'Pediatrica',
  GERIATRICA: 'Geriatrica',
  PREVENTIVA: 'Preventiva',
  OUTRA: 'Outra',
}

export const SPECIALTY_LABELS: Record<string, string> = {
  PILATES: 'Pilates',
  RPG: 'RPG',
  ACUPUNTURA: 'Acupuntura',
  LIBERACAO_MIOFASCIAL: 'Liberacao miofascial',
  VENTOSATERAPIA: 'Ventosaterapia',
  DRY_NEEDLING: 'Dry needling',
  TERAPIA_MANUAL: 'Terapia manual',
  OUTRA: 'Outra',
}

export const ATTENDANCE_TYPE_LABELS: Record<string, string> = {
  CLINIC: 'Clinica',
  HOME_CARE: 'Domiciliar',
  HOSPITAL: 'Hospital',
  CORPORATE: 'Corporativo',
  ONLINE: 'Online',
}

export const PLAN_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  PAUSED: 'Pausado',
  COMPLETED: 'Concluido',
  CANCELED: 'Cancelado',
}

export const PRICING_MODEL_LABELS: Record<string, string> = {
  PER_SESSION: 'Por sessao',
  PACKAGE: 'Pacote',
}

export function formatSpecialties(specialties?: string[] | null) {
  if (!specialties?.length) return ''
  return specialties.map((specialty) => SPECIALTY_LABELS[specialty] ?? specialty).join(', ')
}

export function formatTreatmentPlanLabel(plan?: {
  area?: string | null
  specialties?: string[] | null
}) {
  if (!plan?.area) return 'Avulso'

  const area = THERAPY_AREA_LABELS[plan.area] ?? plan.area
  const specialties = formatSpecialties(plan.specialties)

  return specialties ? `${area} (${specialties})` : area
}
