import { z } from 'zod'

export const registerDTO = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
})

export const loginDTO = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export type RegisterDTO = z.infer<typeof registerDTO>
export type LoginDTO = z.infer<typeof loginDTO>
