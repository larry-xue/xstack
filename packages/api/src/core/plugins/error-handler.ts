import { Elysia } from 'elysia'
import {
  AppError,
  ErrorCodeEnum,
  createErrorEnvelope,
  isDatabaseError,
  isDatabaseUnavailableError,
  mapFrameworkError,
} from '@api/core/http/errors'
import type { Logger } from '@api/core/logging/logger'

type ErrorPluginSingleton = {
  decorator: {}
  store: {}
  derive: { requestId: string; requestStart?: number; auth?: { userId?: string } }
  resolve: {}
}

const toErrorMessage = (value: unknown) => {
  if (value instanceof Error) {
    return value.message
  }

  return 'Unknown error'
}

const toPathname = (request: Request) => {
  try {
    return new URL(request.url).pathname
  } catch {
    return request.url
  }
}

const extractBearerToken = (request: Request) => {
  const authorization = request.headers.get('authorization')
  if (!authorization) {
    return null
  }

  const [scheme, token] = authorization.split(' ')
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return null
  }

  return token
}

const decodeJwtSub = (token: string) => {
  try {
    const segments = token.split('.')
    const payload = segments[1]
    if (!payload) {
      return null
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded =
      normalized.length % 4 === 0
        ? normalized
        : normalized.padEnd(normalized.length + (4 - (normalized.length % 4)), '=')
    const decoded = JSON.parse(Buffer.from(padded, 'base64').toString('utf-8')) as {
      sub?: unknown
    }

    return typeof decoded.sub === 'string' ? decoded.sub : null
  } catch {
    return null
  }
}

const resolveLogUserId = (request: Request, auth?: { userId?: string }) => {
  if (auth?.userId) {
    return auth.userId
  }

  const token = extractBearerToken(request)
  if (!token) {
    return null
  }

  return decodeJwtSub(token)
}

const toRequestLogContext = (input: {
  request: Request
  requestStart?: number
  auth?: { userId?: string }
}) => {
  const durationMs =
    typeof input.requestStart === 'number' ? Date.now() - input.requestStart : undefined

  return {
    method: input.request.method,
    path: toPathname(input.request),
    userId: resolveLogUserId(input.request, input.auth),
    durationMs,
  }
}

export const createErrorPlugin = (logger: Logger) =>
  new Elysia<'', ErrorPluginSingleton>().onError(
    { as: 'global' },
    ({ code, error, set, request, requestId = 'unknown', requestStart, auth }) => {
      const requestContext = toRequestLogContext({
        request,
        requestStart,
        auth,
      })

      if (error instanceof AppError) {
        set.status = error.status
        logger.warn('request_failed', {
          ...requestContext,
          requestId,
          code: error.code,
          status: error.status,
          message: error.message,
        })
        return createErrorEnvelope({
          requestId,
          code: error.code,
          message: error.message,
          details: error.details,
        })
      }

      if (isDatabaseUnavailableError(error)) {
        set.status = 503
        logger.error('database_unavailable', {
          ...requestContext,
          requestId,
          message: toErrorMessage(error),
        })
        return createErrorEnvelope({
          requestId,
          code: ErrorCodeEnum.DATABASE_UNAVAILABLE,
          message: 'Database unavailable',
        })
      }

      if (isDatabaseError(error)) {
        set.status = 500
        logger.error('database_error', {
          ...requestContext,
          requestId,
          message: toErrorMessage(error),
        })
        return createErrorEnvelope({
          requestId,
          code: ErrorCodeEnum.DATABASE_ERROR,
          message: 'Database operation failed',
        })
      }

      const mapped = mapFrameworkError(code)
      set.status = mapped.status

      if (mapped.status >= 500) {
        logger.error('request_failed', {
          ...requestContext,
          requestId,
          frameworkCode: code,
          message: toErrorMessage(error),
        })
      } else {
        logger.warn('request_failed', {
          ...requestContext,
          requestId,
          frameworkCode: code,
          message: toErrorMessage(error),
        })
      }

      return createErrorEnvelope({
        requestId,
        code: mapped.code,
        message: mapped.message,
      })
    },
  )
