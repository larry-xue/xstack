import { Elysia, t } from 'elysia'
export const rootRoutes = new Elysia()
  .get(
    '/',
    () => ({ service: 'api', status: 'ok' } as const),
    {
      response: {
        200: t.Object({
          service: t.Literal('api'),
          status: t.Literal('ok'),
        }),
      },
    },
  )
  .get(
    '/health',
    () => ({ ok: true } as const),
    {
      response: {
        200: t.Object({
          ok: t.Literal(true),
        }),
      },
    },
  )
