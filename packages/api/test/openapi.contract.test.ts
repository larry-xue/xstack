import { describe, expect, test } from 'vitest'
import { createApp } from '../src/app'

describe('OpenAPI contract', () => {
  test('runtime spec exposes expected endpoints', async () => {
    const app = createApp()
    const response = await app.fetch(new Request('http://localhost/openapi/json'))

    expect(response.status).toBe(200)
    const runtimeSpec = (await response.json()) as Record<string, unknown>
    expect(runtimeSpec.paths).toHaveProperty('/api/v1/todos')
    expect(runtimeSpec.paths).toHaveProperty('/health')
  })
})
