import { Elysia } from 'elysia'

const toRequestId = (request: Request) => {
  const header = request.headers.get('x-request-id')
  return header && header.length > 0 ? header : crypto.randomUUID()
}

export const requestContextPlugin = new Elysia()
  .derive({ as: 'scoped' }, ({ request }) => {
    const requestId = toRequestId(request)
    const requestStart = Date.now()

    return {
      requestId,
      requestStart,
    }
  })
  .onBeforeHandle(({ requestId, set }) => {
    set.headers['x-request-id'] = requestId
  })
  .onAfterResponse(({ request, requestId, requestStart, set }) => {
    const durationMs = Date.now() - requestStart
    const status = set.status ?? 200

    console.info(
      JSON.stringify({
        requestId,
        method: request.method,
        path: new URL(request.url).pathname,
        status: typeof status === 'number' ? status : Number(status),
        durationMs,
      }),
    )
  })
