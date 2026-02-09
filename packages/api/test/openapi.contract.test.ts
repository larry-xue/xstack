import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { createApp } from '../src/app'

describe('OpenAPI contract', () => {
  test('runtime spec matches committed client contract', async () => {
    const app = createApp()
    const response = await app.fetch(new Request('http://localhost/openapi/json'))

    expect(response.status).toBe(200)
    const runtimeSpec = (await response.json()) as Record<string, unknown>
    const committedSpecPath = resolve(process.cwd(), '../api-client/openapi/openapi.json')
    const committedSpec = JSON.parse(readFileSync(committedSpecPath, 'utf-8')) as Record<
      string,
      unknown
    >

    expect(runtimeSpec).toEqual(committedSpec)
    expect(runtimeSpec.paths).toHaveProperty('/api/v1/todos')
    expect(runtimeSpec.paths).toHaveProperty('/health')
  })
})
