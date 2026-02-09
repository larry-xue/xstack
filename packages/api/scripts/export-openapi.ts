import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createApp } from '../src/app'

const exportOpenApi = async () => {
  const app = createApp()
  const response = await app.fetch(new Request('http://localhost/openapi/json'))

  if (!response.ok) {
    throw new Error(`Failed to load OpenAPI schema: ${response.status}`)
  }

  const schema = await response.json()
  const outputPath = resolve(process.cwd(), '../api-client/openapi/openapi.json')
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(schema, null, 2)}\n`, 'utf-8')
}

await exportOpenApi()
