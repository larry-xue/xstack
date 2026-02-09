import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { config as loadDotenv } from 'dotenv'

const ENV_FILES = ['.env.local', '.env'] as const

export type NodeEnv = 'development' | 'test' | 'production'

export type RuntimeConfig = {
  nodeEnv: NodeEnv
  port: number
  databaseUrl: string
  supabaseJwtSecret: string
  supabaseJwtIssuer: string | null
  supabaseJwksUrl: string | null
}

type LoadRuntimeConfigOptions = {
  cwd?: string
  env?: NodeJS.ProcessEnv
}

export const loadEnvFiles = (cwd = process.cwd()) => {
  for (const fileName of ENV_FILES) {
    const absolutePath = resolve(cwd, fileName)
    if (existsSync(absolutePath)) {
      loadDotenv({
        path: absolutePath,
        override: false,
        quiet: true,
      })
    }
  }
}

const parseNodeEnv = (value: string | undefined): NodeEnv => {
  if (value === 'production' || value === 'test') {
    return value
  }

  return 'development'
}

const parsePort = (value: string | undefined): number => {
  if (!value) {
    return 54545
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`PORT must be a positive integer. Received: ${value}`)
  }

  return parsed
}

const optionalEnv = (env: NodeJS.ProcessEnv, key: string) => {
  const value = env[key]
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const loadRuntimeConfig = (options?: LoadRuntimeConfigOptions): RuntimeConfig => {
  const cwd = options?.cwd ?? process.cwd()
  if (!options?.env) {
    loadEnvFiles(cwd)
  }

  const env = options?.env ?? process.env
  const missing: string[] = []

  const databaseUrl = optionalEnv(env, 'DATABASE_URL')
  if (!databaseUrl) {
    missing.push('DATABASE_URL')
  }

  const supabaseJwtSecret = optionalEnv(env, 'SUPABASE_JWT_SECRET')
  if (!supabaseJwtSecret) {
    missing.push('SUPABASE_JWT_SECRET')
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}.`)
  }

  const requiredDatabaseUrl = databaseUrl
  const requiredSupabaseJwtSecret = supabaseJwtSecret
  if (!requiredDatabaseUrl || !requiredSupabaseJwtSecret) {
    throw new Error('Missing required environment variables.')
  }

  return {
    nodeEnv: parseNodeEnv(env.NODE_ENV),
    port: parsePort(env.PORT),
    databaseUrl: requiredDatabaseUrl,
    supabaseJwtSecret: requiredSupabaseJwtSecret,
    supabaseJwtIssuer: optionalEnv(env, 'SUPABASE_JWT_ISS'),
    supabaseJwksUrl: optionalEnv(env, 'SUPABASE_JWKS_URL'),
  }
}
