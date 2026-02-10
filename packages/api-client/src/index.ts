import { treaty, type Treaty } from '@elysiajs/eden'
import type { App } from '@repo/api'

export const ApiErrorCodeEnum = {
  AUTH_MISSING_TOKEN: 'AUTH_MISSING_TOKEN',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  DATABASE_UNAVAILABLE: 'DATABASE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ApiErrorCode = (typeof ApiErrorCodeEnum)[keyof typeof ApiErrorCodeEnum] | (string & {})

export type RequestOptions = {
  baseUrl?: string
  getAccessToken?: () => Promise<string | null>
  fetcher?: typeof fetch
}

type ApiClientErrorParams = {
  code: ApiErrorCode | null
  message: string
  requestId: string | null
  details: unknown | null
  status: number | null
}

export class ApiClientError extends Error {
  readonly code: ApiErrorCode | null
  readonly requestId: string | null
  readonly details: unknown | null
  readonly status: number | null

  constructor(params: ApiClientErrorParams) {
    super(params.message)
    this.name = 'ApiClientError'
    this.code = params.code
    this.requestId = params.requestId
    this.details = params.details
    this.status = params.status
  }
}

export const isApiClientError = (error: unknown): error is ApiClientError =>
  error instanceof ApiClientError ||
  (Boolean(error) &&
    typeof error === 'object' &&
    (error as { name?: unknown }).name === 'ApiClientError' &&
    typeof (error as { message?: unknown }).message === 'string')

type RecordLike = Record<string, unknown>

type ErrorEnvelopePayload = {
  code: ApiErrorCode | null
  message: string | null
  requestId: string | null
  details: unknown | null
}

const asRecordLike = (value: unknown): RecordLike | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  return value as RecordLike
}

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null

const asNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const toErrorEnvelopePayload = (value: unknown): ErrorEnvelopePayload | null => {
  const envelope = asRecordLike(value)
  const errorData = envelope ? asRecordLike(envelope.error) : null
  if (!errorData) {
    return null
  }

  const code = asString(errorData.code)
  const message = asString(errorData.message)
  const requestId = asString(errorData.requestId)
  const details = Object.hasOwn(errorData, 'details') ? (errorData.details ?? null) : null

  return {
    code,
    message,
    requestId,
    details,
  }
}

const toApiClientError = (error: unknown, fallbackMessage: string) => {
  const errorLike = asRecordLike(error)
  const value = errorLike?.value
  const envelope = toErrorEnvelopePayload(value)
  const status = asNumber(errorLike?.status)
  const rawMessage =
    envelope?.message ??
    asString(value) ??
    asString(errorLike?.message) ??
    (error instanceof Error ? asString(error.message) : null)

  return new ApiClientError({
    code: envelope?.code ?? null,
    message: rawMessage ?? fallbackMessage,
    requestId: envelope?.requestId ?? null,
    details: envelope?.details ?? null,
    status,
  })
}

type ResponseMap = Record<number, unknown>
type EnvelopeDataFromResponses<TResponses extends ResponseMap> =
  Extract<TResponses[keyof TResponses], { data: unknown }> extends { data: infer TData }
    ? TData
    : never

export const unwrapApiEnvelope = <TResponses extends ResponseMap>(
  result: Treaty.TreatyResponse<TResponses>,
  fallbackMessage: string,
) => {
  if (result.error) {
    throw toApiClientError(result.error, fallbackMessage)
  }

  if (!result.data || typeof result.data !== 'object' || !('data' in result.data)) {
    throw new ApiClientError({
      code: null,
      message: 'Expected JSON response body',
      requestId: null,
      details: null,
      status: null,
    })
  }

  return result.data.data as EnvelopeDataFromResponses<TResponses>
}

export const createApiClient = (options: RequestOptions = {}) => {
  const baseUrl = options.baseUrl ? options.baseUrl.replace(/\/+$/, '') : ''

  return treaty<App>(baseUrl, {
    keepDomain: true,
    fetcher: options.fetcher ?? fetch,
    headers: async () => {
      const accessToken = options.getAccessToken ? await options.getAccessToken() : null
      if (!accessToken) {
        return undefined
      }

      return {
        authorization: `Bearer ${accessToken}`,
      }
    },
  })
}
