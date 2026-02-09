import { Elysia } from 'elysia'
import { AppError } from '../schemas/error'
import {
  getBearerToken,
  verifySupabaseJwt,
  type AuthContext as SupabaseAuthContext,
} from '../auth'

export type AuthContext = SupabaseAuthContext

const authPlugin = new Elysia()
  .derive(
    { as: 'global' },
    async ({ request }): Promise<{ auth: AuthContext | null }> => {
    const token = getBearerToken(request)
    if (!token) {
      return { auth: null }
    }

    try {
      const auth = await verifySupabaseJwt(token)
      return { auth }
    } catch {
      return { auth: null }
    }
    },
  )

type AuthGuardSingleton = {
  decorator: {}
  store: {}
  derive: { auth: AuthContext; requestId: string }
  resolve: {}
}

export const authGuard = new Elysia<'', AuthGuardSingleton>()
  .use(authPlugin)
  .resolve({ as: 'scoped' }, ({ auth }) => {
    if (!auth) {
      throw new AppError({
        code: 'UNAUTHORIZED',
        status: 401,
        message: 'Unauthorized',
      })
    }

    return { auth }
  })
