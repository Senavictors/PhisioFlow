export class CalendarNotConnectedError extends Error {
  constructor() {
    super('Conta Google ainda não conectada. Acesse Configurações → Integrações.')
  }
}

export class CalendarNotConfiguredError extends Error {
  constructor() {
    super('Selecione uma agenda padrão antes de sincronizar.')
  }
}

export class CalendarOAuthEnvError extends Error {
  constructor() {
    super(
      'GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_CALENDAR_REDIRECT_URI ausentes no servidor.'
    )
  }
}

export class CalendarOAuthStateError extends Error {
  constructor() {
    super('Parâmetro state do OAuth inválido. Tente conectar novamente.')
  }
}

export class CalendarSyncError extends Error {
  constructor(message: string) {
    super(message)
  }
}
