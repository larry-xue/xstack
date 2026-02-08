import { Elysia, type HTTPHeaders } from 'elysia'

const toRequestId = (request: Request) => {
  const header = request.headers.get('x-request-id')
  return header && header.length > 0 ? header : crypto.randomUUID()
}

const applyRequestIdHeader = (
  set: { headers?: HTTPHeaders },
  requestId: string,
) => {
  if (!set.headers) {
    set.headers = {} as HTTPHeaders
  }
  set.headers['x-request-id'] = requestId
}

export const requestContextPlugin = new Elysia()
  .derive({ as: 'global' }, ({ request }) => {
    const requestId = toRequestId(request)
    const requestStart = Date.now()

    return {
      requestId,
      requestStart,
    }
  })
  .onBeforeHandle({ as: 'global' }, ({ requestId, set }) => {
    applyRequestIdHeader(set, requestId)
  })
  .onAfterHandle({ as: 'global' }, ({ requestId, set }) => {
    applyRequestIdHeader(set, requestId)
  })
  .mapResponse({ as: 'global' }, ({ requestId, response, set }) => {
    applyRequestIdHeader(set, requestId)
    if (response instanceof Response) {
      response.headers.set('x-request-id', requestId)
      return response
    }
  })
  .onError({ as: 'global' }, ({ request, requestId, set }) => {
    const resolvedRequestId = requestId && requestId.length > 0
      ? requestId
      : toRequestId(request)
    applyRequestIdHeader(set, resolvedRequestId)
  })
  .onAfterResponse({ as: 'global' }, ({ request, requestId, requestStart, set }) => {
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
