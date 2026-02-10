import { Elysia } from 'elysia'
import { AppError, ErrorCodeEnum } from '@api/core/http/errors'
import type {
  AuthPrincipal,
  AuthProvider,
} from '@api/modules/auth/application/ports/auth-provider'

const extractBearerToken = (request: Request): string | null => {
  const authorization = request.headers.get('authorization')
  if (!authorization) {
    return null
  }

  const [scheme, token] = authorization.split(' ')
  if (!scheme || !token) {
    return null
  }

  if (scheme.toLowerCase() !== 'bearer') {
    return null
  }

  return token
}

type AuthGuardSingleton = {
  decorator: {}
  store: {}
  derive: { auth: AuthPrincipal; requestId: string }
  resolve: {}
}

export const createAuthGuardPlugin = (authProvider: AuthProvider) =>
  new Elysia<'', AuthGuardSingleton>().resolve({ as: 'scoped' }, async ({ request }) => {
    const token = extractBearerToken(request)
    if (!token) {
      throw new AppError({
        code: ErrorCodeEnum.AUTH_MISSING_TOKEN,
        status: 401,
        message: 'Missing bearer token',
      })
    }

    try {
      const auth = await authProvider.verifyBearerToken(token)
      return { auth }
    } catch {
      throw new AppError({
        code: ErrorCodeEnum.AUTH_INVALID_TOKEN,
        status: 401,
        message: 'Invalid bearer token',
      })
    }
  })
