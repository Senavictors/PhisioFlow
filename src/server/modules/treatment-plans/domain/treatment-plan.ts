export class TreatmentPlanNotFoundError extends Error {
  constructor(message = 'Plano de tratamento não encontrado') {
    super(message)
    this.name = 'TreatmentPlanNotFoundError'
  }
}

export class TreatmentPlanInactiveError extends Error {
  constructor(message = 'Plano de tratamento não está ativo') {
    super(message)
    this.name = 'TreatmentPlanInactiveError'
  }
}

export class WorkplaceForPlanNotFoundError extends Error {
  constructor(message = 'Local de trabalho não encontrado') {
    super(message)
    this.name = 'WorkplaceForPlanNotFoundError'
  }
}
