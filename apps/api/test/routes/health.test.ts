import { expect, test } from 'vitest'
import { build } from '../helper'

test('health route', async () => {
  const app = await build()

  const res = await app.inject({
    method: 'GET',
    url: '/health',
  })

  expect(res.statusCode).toBe(200)
  expect(JSON.parse(res.payload)).toEqual({ ok: true })
})
