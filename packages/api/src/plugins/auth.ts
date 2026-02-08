import { Elysia } from 'elysia'
import { buildError } from '../schemas/error'
import {
  getBearerToken,
  verifySupabaseJwt,
  type AuthContext as SupabaseAuthContext,
} from '../auth'

export type AuthContext = SupabaseAuthContext

export const authPlugin = new Elysia()
  .derive(
    { as: 'scoped' },
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
  derive: { auth: AuthContext | null; requestId: string }
  resolve: {}
}

export const authGuard = new Elysia<'', AuthGuardSingleton>()
  .use(authPlugin)
  .onBeforeHandle(({ auth, set, requestId = 'unknown' }) => {
    if (!auth) {
      set.status = 401
      return buildError({
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
        requestId,
      })
    }
  })
