import { expect, test } from 'vitest'
import { createApp } from '../src/app'

test('GET /health returns ok', async () => {
  const app = createApp()

  const response = await app.fetch(new Request('http://localhost/health'))

  expect(response.status).toBe(200)
  await expect(response.json()).resolves.toEqual({ ok: true })
})
