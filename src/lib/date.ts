function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value)
}

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
