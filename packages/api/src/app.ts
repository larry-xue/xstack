import { openapi } from '@elysiajs/openapi'
import { Elysia, t } from 'elysia'

type ElysiaOptions = NonNullable<ConstructorParameters<typeof Elysia>[0]>
type CreateAppOptions = Pick<ElysiaOptions, 'adapter'>

export const createApp = (options?: CreateAppOptions) =>
  new Elysia(options)
    .use(openapi())
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

export type App = ReturnType<typeof createApp>
