import { decryptSecret } from '@/lib/crypto'
import { deleteCalendarConnection, findCalendarConnection } from '../infra/calendar.repository'
import { revokeRefreshToken } from '../infra/google-oauth'

export async function disconnectGoogleCalendarUseCase(userId: string) {
  const connection = await findCalendarConnection(userId)
  if (!connection) return

  await revokeRefreshToken(decryptSecret(connection.encryptedRefreshToken))
  await deleteCalendarConnection(userId)
}
