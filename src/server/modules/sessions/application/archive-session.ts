import { archiveSession, findSessionById } from '../infra/session.repository'
import { SessionNotFoundError } from './get-session'

export async function archiveSessionUseCase(id: string, userId: string) {
  const existing = await findSessionById(id, userId)

  if (!existing) {
    throw new SessionNotFoundError('Sessão não encontrada')
  }

  await archiveSession(id)
}
