import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

type RuntimeEnv = Record<string, string | undefined>
const runtimeEnv =
  (globalThis as { process?: { env?: RuntimeEnv } }).process?.env ?? {}

const getDatabaseUrl = () => {
  const url = runtimeEnv.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is required')
  }
  return url
}

const globalForPrisma = globalThis as { prisma?: PrismaClient }

export const getPrisma = () => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const adapter = new PrismaPg({ connectionString: getDatabaseUrl() })
  const prisma = new PrismaClient({ adapter })

  if (runtimeEnv.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }

  return prisma
}

export const disconnectPrisma = async () => {
  if (!globalForPrisma.prisma) {
    return
  }

  await globalForPrisma.prisma.$disconnect()
}
