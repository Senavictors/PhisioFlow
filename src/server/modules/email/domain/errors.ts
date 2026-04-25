export class EmailSettingsNotConfiguredError extends Error {
  constructor() {
    super('Configuração de e-mail incompleta. Acesse Configurações para conectar seu Gmail.')
  }
}

export class EmailSendingDisabledError extends Error {
  constructor() {
    super('Envio de e-mails está desativado nas suas configurações.')
  }
}

export class PatientEmailMissingError extends Error {
  constructor() {
    super('Paciente não possui e-mail cadastrado.')
  }
}

export class EmailDeliveryError extends Error {
  constructor(message: string) {
    super(message)
  }
}
