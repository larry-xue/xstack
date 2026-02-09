import { Elysia } from 'elysia'
import {
  AppError,
  ErrorCodeEnum,
  createErrorEnvelope,
  isDatabaseError,
  isDatabaseUnavailableError,
  mapFrameworkError,
} from '../http/errors'
import type { Logger } from '../logging/logger'

type ErrorPluginSingleton = {
  decorator: {}
  store: {}
  derive: { requestId: string }
  resolve: {}
}

const toErrorMessage = (value: unknown) => {
  if (value instanceof Error) {
    return value.message
  }

  return 'Unknown error'
}

export const createErrorPlugin = (logger: Logger) =>
  new Elysia<'', ErrorPluginSingleton>().onError(
    { as: 'global' },
    ({ code, error, set, requestId = 'unknown' }) => {
      if (error instanceof AppError) {
        set.status = error.status
        logger.warn('request_failed', {
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
          requestId,
          frameworkCode: code,
          message: toErrorMessage(error),
        })
      } else {
        logger.warn('request_failed', {
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
