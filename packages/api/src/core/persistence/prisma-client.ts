import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import type { NodeEnv } from '@api/core/config/runtime-config'

type GetPrismaClientOptions = {
  databaseUrl: string
  nodeEnv: NodeEnv
}

type GlobalPrismaStore = {
  prismaClientsByUrl?: Map<string, PrismaClient>
}

const globalPrismaStore = globalThis as unknown as GlobalPrismaStore

const createPrismaClient = (databaseUrl: string) => {
  const adapter = new PrismaPg({ connectionString: databaseUrl })
  return new PrismaClient({ adapter })
}

export const getPrismaClient = ({ databaseUrl, nodeEnv }: GetPrismaClientOptions): PrismaClient => {
  if (nodeEnv === 'production') {
    return createPrismaClient(databaseUrl)
  }

  if (!globalPrismaStore.prismaClientsByUrl) {
    globalPrismaStore.prismaClientsByUrl = new Map<string, PrismaClient>()
  }

  const existing = globalPrismaStore.prismaClientsByUrl.get(databaseUrl)
  if (existing) {
    return existing
  }

  const prisma = createPrismaClient(databaseUrl)
  globalPrismaStore.prismaClientsByUrl.set(databaseUrl, prisma)
  return prisma
}

export const disconnectPrismaClient = async (prisma: PrismaClient) => {
  await prisma.$disconnect()
}

export type PrismaClientInstance = PrismaClient
