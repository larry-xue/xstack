import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { openapi } from '@elysiajs/openapi'

export const createApp = () => {
  const app = new Elysia({ adapter: node() })
    .use(openapi())
    .get('/', () => ({ service: 'api', status: 'ok' }))
    .get('/health', () => ({ ok: true }))

  return app
}

export type App = ReturnType<typeof createApp>
