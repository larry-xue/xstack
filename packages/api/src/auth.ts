import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } from 'jose'

type RuntimeEnv = Record<string, string | undefined>
const getRuntimeEnv = (): RuntimeEnv =>
  (globalThis as { process?: { env?: RuntimeEnv } }).process?.env ?? {}

const getJwtSecret = () => {
  const secret = getRuntimeEnv().SUPABASE_JWT_SECRET
  if (!secret) {
    throw new Error('SUPABASE_JWT_SECRET is required')
  }
  return new TextEncoder().encode(secret)
}

const getJwtIssuer = () => {
  const issuer = getRuntimeEnv().SUPABASE_JWT_ISS
  if (issuer && issuer.length > 0) {
    return issuer
  }

  return null;
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

let remoteJwks: ReturnType<typeof createRemoteJWKSet> | null = null

const getJwksUrl = () => {
  const explicit = getRuntimeEnv().SUPABASE_JWKS_URL
  if (explicit && explicit.length > 0) {
    return explicit
  }

  const issuer = getJwtIssuer()
  if (!issuer) {
    return undefined
  }

  return `${issuer.replace(/\/$/, '')}/.well-known/jwks.json`
}

const getRemoteJwks = () => {
  if (remoteJwks) {
    return remoteJwks
  }

  const jwksUrl = getJwksUrl()
  if (!jwksUrl) {
    throw new Error('SUPABASE_JWKS_URL or SUPABASE_JWT_ISS is required')
  }

  remoteJwks = createRemoteJWKSet(new URL(jwksUrl))
  return remoteJwks
}

const verifyWithSharedSecret = async (token: string) => {
  const issuer = getJwtIssuer()
  return jwtVerify(token, getJwtSecret(), issuer ? { issuer } : undefined)
}

const verifyWithJwks = async (token: string) => {
  const issuer = getJwtIssuer()
  return jwtVerify(token, getRemoteJwks(), issuer ? { issuer } : undefined)
}

export const verifySupabaseJwt = async (token: string): Promise<AuthContext> => {
  const { alg } = decodeProtectedHeader(token)

  if (!alg) {
    throw new Error('Token algorithm is missing')
  }

  const isHmac = alg.toUpperCase().startsWith('HS')
  const { payload } = isHmac
    ? await verifyWithSharedSecret(token)
    : await verifyWithJwks(token)

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
