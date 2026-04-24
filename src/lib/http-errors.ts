type ErrorWithCode = {
  code?: string
  message?: string
}

function asErrorWithCode(error: unknown): ErrorWithCode | null {
  if (typeof error !== 'object' || error === null) return null
  return error as ErrorWithCode
}

export function getInfraErrorResponse(error: unknown) {
  const parsedError = asErrorWithCode(error)
  const code = parsedError?.code

  if (code === 'P1001') {
    return {
      status: 503,
      message:
        'Não foi possível conectar ao banco de dados. Verifique a DATABASE_URL e reinicie o servidor.',
    }
  }

  if (code === 'P2021') {
    return {
      status: 500,
      message: 'A tabela esperada não existe no banco. Rode as migrations pendentes.',
    }
  }

  return null
}

export function logRouteError(route: string, error: unknown) {
  console.error(`[${route}]`, error)
}
