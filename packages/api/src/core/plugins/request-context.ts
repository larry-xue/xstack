import { Elysia, type HTTPHeaders } from 'elysia'
import type { RequestContext } from '@api/core/http/request-context'

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

export const createRequestContextPlugin = () =>
  new Elysia()
    .derive({ as: 'global' }, ({ request }): RequestContext => {
      const requestId = resolveRequestId(request)
      return {
        requestId,
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
