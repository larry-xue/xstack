import { Elysia, t } from 'elysia'
import { makeSuccessEnvelopeSchema, toSuccessEnvelope } from '@api/core/http/envelope'

type RequestContextSingleton = {
  decorator: {}
  store: {}
  derive: { requestId: string }
  resolve: {}
}

const serviceStatusSchema = t.Object({
  service: t.Literal('api'),
  status: t.Literal('ok'),
})

const healthStatusSchema = t.Object({
  ok: t.Literal(true),
})

export const createSystemRoutes = () =>
  new Elysia<'', RequestContextSingleton>()
    .get(
      '/',
      ({ requestId }) =>
        toSuccessEnvelope(
          {
            service: 'api' as const,
            status: 'ok' as const,
          },
          requestId,
        ),
      {
        detail: { tags: ['System'] },
        response: {
          200: makeSuccessEnvelopeSchema(serviceStatusSchema),
        },
      },
    )
    .get(
      '/health',
      ({ requestId }) =>
        toSuccessEnvelope(
          {
            ok: true as const,
          },
          requestId,
        ),
      {
        detail: { tags: ['System'] },
        response: {
          200: makeSuccessEnvelopeSchema(healthStatusSchema),
        },
      },
    )
