export class WorkplaceNotFoundError extends Error {
  constructor(message = 'Local de trabalho não encontrado') {
    super(message)
    this.name = 'WorkplaceNotFoundError'
  }
}
