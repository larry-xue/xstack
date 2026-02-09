import { Elysia, type HTTPHeaders } from 'elysia'
import type { Logger } from '../logging/logger'
import type { RequestContext } from '../http/request-context'

const resolveRequestId = (request: Request) => {
  const headerRequestId = request.headers.get('x-request-id')
  if (headerRequestId && headerRequestId.length > 0) {
    return headerRequestId
  }

  return crypto.randomUUID()
}

const applyRequestIdHeader = (set: { headers?: HTTPHeaders }, requestId: string) => {
  if (!set.headers) {
    set.headers = {} as HTTPHeaders
  }

  set.headers['x-request-id'] = requestId
}

export const createRequestContextPlugin = (logger: Logger) =>
  new Elysia()
    .derive({ as: 'global' }, ({ request }): RequestContext => {
      const requestId = resolveRequestId(request)
      return {
        requestId,
        requestStart: Date.now(),
      }
    })
    .onBeforeHandle({ as: 'global' }, ({ requestId, set }) => {
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
      const safeRequestId =
        requestId && requestId.length > 0 ? requestId : resolveRequestId(request)
      applyRequestIdHeader(set, safeRequestId)
    })
    .onAfterResponse({ as: 'global' }, ({ request, requestId, requestStart, set }) => {
      const status = set.status ?? 200
      const statusCode = typeof status === 'number' ? status : Number(status)

      logger.info('http_request_completed', {
        requestId,
        method: request.method,
        path: new URL(request.url).pathname,
        status: statusCode,
        durationMs: Date.now() - requestStart,
      })
    })
