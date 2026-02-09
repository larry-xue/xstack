import { expect, test } from 'vitest'
import { createApp } from '../src/app'

test('GET /health returns ok', async () => {
  const app = createApp()

  const response = await app.fetch(new Request('http://localhost/health'))

  expect(response.status).toBe(200)
  const body = (await response.json()) as {
    data: {
      ok: true
    }
    meta: {
      requestId: string
    }
  }

  expect(body.data.ok).toBe(true)
  expect(body.meta.requestId).toBeTruthy()
  expect(response.headers.get('x-request-id')).toBe(body.meta.requestId)
})
