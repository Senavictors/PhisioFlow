import bcrypt from 'bcryptjs'
import type { LoginDTO } from '../http/auth.dto'
import { findUserByEmail } from '../infra/user.repository'

export class InvalidCredentialsError extends Error {}

export async function loginUser(dto: LoginDTO) {
  const user = await findUserByEmail(dto.email)
  if (!user) throw new InvalidCredentialsError('Credenciais inválidas')

  const valid = await bcrypt.compare(dto.password, user.password)
  if (!valid) throw new InvalidCredentialsError('Credenciais inválidas')

  return { id: user.id, email: user.email, name: user.name }
}
