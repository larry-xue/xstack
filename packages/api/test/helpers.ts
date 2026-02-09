import { SignJWT } from 'jose'
import { loadRuntimeConfig } from '../src/core/config/runtime-config'
import { getPrismaClient } from '../src/core/persistence/prisma-client'

const runtimeConfig = loadRuntimeConfig()
const prisma = getPrismaClient({
  databaseUrl: runtimeConfig.databaseUrl,
  nodeEnv: runtimeConfig.nodeEnv,
})

const getJwtSecret = () => {
  const secret = process.env.SUPABASE_JWT_SECRET
  if (!secret) {
    throw new Error('SUPABASE_JWT_SECRET is required for tests')
  }
  return new TextEncoder().encode(secret)
}

const getJwtIssuer = () => {
  const issuer = process.env.SUPABASE_JWT_ISS
  return issuer && issuer.length > 0 ? issuer : undefined
}

export const createJwt = async (userId: string) => {
  const issuer = getJwtIssuer()
  const jwt = new SignJWT({ role: 'authenticated' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('1h')

  if (issuer) {
    jwt.setIssuer(issuer)
  }

  return jwt.sign(getJwtSecret())
}

export const authHeader = (token: string) => ({
  authorization: `Bearer ${token}`,
})

export const resetTodos = async (userId: string) => {
  await prisma.todo.deleteMany({ where: { userId } })
}
