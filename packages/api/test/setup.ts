import { loadEnvFiles } from '../src/core/config/runtime-config'

loadEnvFiles(process.cwd())

if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST
}

process.env.NODE_ENV = 'test'
