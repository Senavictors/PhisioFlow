import { findSessionById } from '../infra/session.repository'

export class SessionNotFoundError extends Error {}

export async function getSessionUseCase(id: string, userId: string) {
  const session = await findSessionById(id, userId)

  if (!session) {
    throw new SessionNotFoundError('Sessão não encontrada')
  }

  return session
}
