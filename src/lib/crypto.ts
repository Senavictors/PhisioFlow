import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const KEY_BYTES = 32

let cachedKey: Buffer | null = null

function getKey(): Buffer {
  if (cachedKey) return cachedKey

  const raw = process.env.INTEGRATION_ENCRYPTION_KEY
  if (!raw) {
    throw new Error('INTEGRATION_ENCRYPTION_KEY ausente. Defina-a no .env (32 bytes em base64).')
  }

  let key: Buffer
  try {
    key = Buffer.from(raw, 'base64')
  } catch {
    throw new Error('INTEGRATION_ENCRYPTION_KEY inválida: deve ser uma string base64.')
  }

  if (key.length !== KEY_BYTES) {
    throw new Error(
      `INTEGRATION_ENCRYPTION_KEY deve representar ${KEY_BYTES} bytes (32 bytes em base64).`
    )
  }

  cachedKey = key
  return key
}

export function encryptSecret(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`
}

export function decryptSecret(payload: string): string {
  const key = getKey()
  const [ivPart, tagPart, dataPart] = payload.split(':')
  if (!ivPart || !tagPart || !dataPart) {
    throw new Error('Payload criptografado inválido.')
  }
  const iv = Buffer.from(ivPart, 'base64')
  const tag = Buffer.from(tagPart, 'base64')
  const data = Buffer.from(dataPart, 'base64')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  const plaintext = Buffer.concat([decipher.update(data), decipher.final()])
  return plaintext.toString('utf8')
}
