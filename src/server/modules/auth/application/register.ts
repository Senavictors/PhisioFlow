import bcrypt from 'bcryptjs'
import type { RegisterDTO } from '../http/auth.dto'
import { findUserByEmail, createUser } from '../infra/user.repository'

export class EmailAlreadyExistsError extends Error {}

export async function registerUser(dto: RegisterDTO) {
  const existing = await findUserByEmail(dto.email)
  if (existing) throw new EmailAlreadyExistsError('E-mail já cadastrado')

  const hashed = await bcrypt.hash(dto.password, 12)
  const user = await createUser({ name: dto.name, email: dto.email, password: hashed })

  return { id: user.id, email: user.email, name: user.name }
}
