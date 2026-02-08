import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local', quiet: true })

if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST
}

process.env.NODE_ENV = 'test'
