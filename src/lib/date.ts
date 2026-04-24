function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value)
}

const APP_TIME_ZONE = 'America/Sao_Paulo'

export function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

export function formatDateOnlyPtBr(value: Date | string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(toDate(value))
}

export function formatDateOnlyInputValue(value: Date | string) {
  const date = toDate(value)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDateKey(value: Date | string) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(toDate(value))
}

export function formatCalendarDateKey(value: Date | string) {
  return formatDateKey(value)
}

export function formatTimePtBr(value: Date | string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: APP_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(toDate(value))
}

export function formatDateLongPtBr(value: Date | string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: APP_TIME_ZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(toDate(value))
}

export function formatDateTimeLocalInputValue(value: Date | string) {
  const date = toDate(value)
  const normalized = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)

  return normalized.toISOString().slice(0, 16)
}

export function formatAgendaDayLabel(value: Date | string, reference: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: APP_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const label = formatter.format(toDate(value))
  const todayKey = formatDateKey(reference)
  const tomorrowKey = formatDateKey(new Date(reference.getTime() + 24 * 60 * 60 * 1000))
  const targetKey = formatDateKey(value)

  if (targetKey === todayKey) {
    return `Hoje, ${label}`
  }

  if (targetKey === tomorrowKey) {
    return `Amanhã, ${label}`
  }

  return label.charAt(0).toUpperCase() + label.slice(1)
}
