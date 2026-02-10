import { treaty, type Treaty } from '@elysiajs/eden'
import type { App } from '@repo/api'

export type RequestOptions = {
  baseUrl?: string
  getAccessToken?: () => Promise<string | null>
  fetcher?: typeof fetch
}

type ErrorWithValue = {
  value?: unknown
}

type ErrorEnvelope = {
  error?: {
    message?: string
  }
}

const toErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'value' in error) {
    const payload = (error as ErrorWithValue).value

    if (typeof payload === 'string' && payload.length > 0) {
      return payload
    }

    if (payload && typeof payload === 'object') {
      const message = (payload as ErrorEnvelope).error?.message
      if (typeof message === 'string' && message.length > 0) {
        return message
      }
    }
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }

  return fallback
}

type ResponseMap = Record<number, unknown>
type EnvelopeDataFromResponses<TResponses extends ResponseMap> = Extract<
  TResponses[keyof TResponses],
  { data: unknown }
> extends { data: infer TData }
  ? TData
  : never

export const unwrapApiEnvelope = <TResponses extends ResponseMap>(
  result: Treaty.TreatyResponse<TResponses>,
  fallbackMessage: string,
) => {
  if (result.error) {
    throw new Error(toErrorMessage(result.error, fallbackMessage))
  }

  if (!result.data || typeof result.data !== 'object' || !('data' in result.data)) {
    throw new Error('Expected JSON response body')
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
