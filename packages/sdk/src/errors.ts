export type ErrorEnvelope = {
  error: {
    code: string
    message: string
    details?: unknown
  }
  requestId?: string
}

export type SdkError = {
  code: string
  message: string
  details?: unknown
  status?: number
  requestId?: string
  raw?: unknown
}

type HeaderLike = Headers | Record<string, string | undefined>

type ResponseLike = {
  status?: number
  body?: unknown
  headers?: HeaderLike
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const getHeader = (headers: HeaderLike | undefined, name: string): string | undefined => {
  if (!headers) {
    return undefined
  }

  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(name) ?? undefined
  }

  const entries = Object.entries(headers)
  const match = entries.find(([key]) => key.toLowerCase() === name.toLowerCase())
  return match?.[1]
}

const normalizeInput = (input: ResponseLike | unknown) => {
  if (isRecord(input) && ('body' in input || 'status' in input || 'headers' in input)) {
    const response = input as ResponseLike
    return {
      body: response.body,
      status: typeof response.status === 'number' ? response.status : undefined,
      headers: response.headers,
    }
  }

  return { body: input, status: undefined, headers: undefined }
}

export const parseErrorEnvelope = (input: ResponseLike | unknown): SdkError | null => {
  const { body, status, headers } = normalizeInput(input)
  const requestIdFromHeader = getHeader(headers, 'x-request-id')
  const requestIdFromBody =
    isRecord(body) && typeof body.requestId === 'string' ? body.requestId : undefined
  const requestId = requestIdFromBody ?? requestIdFromHeader

  if (isRecord(body) && isRecord(body.error)) {
    const { error } = body
    if (typeof error.code === 'string' && typeof error.message === 'string') {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
        status,
        requestId,
        raw: body,
      }
    }
  }

  if (isRecord(body) && typeof body.error === 'string' && typeof body.message === 'string') {
    const statusFromBody = typeof body.statusCode === 'number' ? body.statusCode : status
    return {
      code: body.error,
      message: body.message,
      status: statusFromBody,
      requestId,
      raw: body,
    }
  }

  return null
}
