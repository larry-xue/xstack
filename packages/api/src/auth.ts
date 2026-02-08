import { jwtVerify } from 'jose'

const getJwtSecret = () => {
  const secret = process.env.SUPABASE_JWT_SECRET
  if (!secret) {
    throw new Error('SUPABASE_JWT_SECRET is required')
  }
  return new TextEncoder().encode(secret)
}

const getJwtIssuer = () => {
  const issuer = process.env.SUPABASE_JWT_ISS
  return issuer && issuer.length > 0 ? issuer : undefined
}

export type AuthContext = {
  userId: string
  role: 'authenticated'
  token: string
}

export const getBearerToken = (request: Request): string | null => {
  const header = request.headers.get('authorization')
  if (!header) {
    return null
  }

  const [type, token] = header.split(' ')
  if (!type || !token) {
    return null
  }

  if (type.toLowerCase() !== 'bearer') {
    return null
  }

  return token
}

export const verifySupabaseJwt = async (token: string): Promise<AuthContext> => {
  const issuer = getJwtIssuer()
  const { payload } = await jwtVerify(token, getJwtSecret(),
    issuer ? { issuer } : undefined,
  )

  const userId = typeof payload.sub === 'string' ? payload.sub : null
  const role = typeof payload.role === 'string' ? payload.role : null

  if (!userId) {
    throw new Error('Token subject is missing')
  }

  if (role !== 'authenticated') {
    throw new Error('Token role is invalid')
  }

  return {
    userId,
    role: 'authenticated',
    token,
  }
}
