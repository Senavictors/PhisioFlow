export class PaymentNotFoundError extends Error {
  constructor(message = 'Pagamento não encontrado') {
    super(message)
    this.name = 'PaymentNotFoundError'
  }
}

export class InvalidPaymentTargetError extends Error {
  constructor(message = 'Pagamento deve estar vinculado a uma sessão ou a um plano') {
    super(message)
    this.name = 'InvalidPaymentTargetError'
  }
}

export class SessionCoveredByPackageError extends Error {
  constructor(message = 'Sessão coberta por pacote — registre o pagamento no plano') {
    super(message)
    this.name = 'SessionCoveredByPackageError'
  }
}
