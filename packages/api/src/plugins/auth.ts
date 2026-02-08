import { Elysia } from 'elysia'
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

export const authGuard = new Elysia()
  .use(authPlugin)
  .onBeforeHandle(({ auth, set }) => {
    if (!auth) {
      set.status = 401
      return { error: 'Unauthorized' }
    }
  })
