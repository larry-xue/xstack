import { createTaskUseCases, type TaskUseCases } from '../modules/tasks/application/use-cases'
import type { AuthProvider } from '../modules/auth/application/ports/auth-provider'
import { SupabaseAuthProvider } from '../modules/auth/infrastructure/supabase-auth-provider'
import { PrismaTaskRepository } from '../modules/tasks/infrastructure/prisma-task-repository'
import {
  disconnectPrismaClient,
  getPrismaClient,
  type PrismaClientInstance,
} from '../core/persistence/prisma-client'
import { createLogger, type Logger } from '../core/logging/logger'
import { loadRuntimeConfig, type RuntimeConfig } from '../core/config/runtime-config'

export type AppContainer = {
  runtimeConfig: RuntimeConfig
  logger: Logger
  authProvider: AuthProvider
  taskUseCases: TaskUseCases
  dispose: () => Promise<void>
}

type CreateAppContainerOptions = {
  runtimeConfig?: RuntimeConfig
}

export const createAppContainer = (options?: CreateAppContainerOptions): AppContainer => {
  const runtimeConfig = options?.runtimeConfig ?? loadRuntimeConfig()
  const logger = createLogger({
    service: 'api',
    nodeEnv: runtimeConfig.nodeEnv,
  })
  const prisma = getPrismaClient({
    databaseUrl: runtimeConfig.databaseUrl,
    nodeEnv: runtimeConfig.nodeEnv,
  })
  const authProvider = new SupabaseAuthProvider({
    jwtSecret: runtimeConfig.supabaseJwtSecret,
    jwtIssuer: runtimeConfig.supabaseJwtIssuer,
    jwksUrl: runtimeConfig.supabaseJwksUrl,
  })
  const taskRepository = new PrismaTaskRepository(prisma)
  const taskUseCases = createTaskUseCases(taskRepository)

  return {
    runtimeConfig,
    logger,
    authProvider,
    taskUseCases,
    dispose: async () => {
      await disconnectPrismaClient(prisma)
    },
  }
}

export type { PrismaClientInstance }
