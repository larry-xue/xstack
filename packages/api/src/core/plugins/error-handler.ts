import { Elysia } from 'elysia'
import {
  AppError,
  ErrorCodeEnum,
  createErrorEnvelope,
  isDatabaseError,
  isDatabaseUnavailableError,
  mapFrameworkError,
} from '@api/core/http/errors'

type ErrorPluginSingleton = {
  decorator: {}
  store: {}
  derive: { requestId: string }
  resolve: {}
}

export const createErrorPlugin = () =>
  new Elysia<'', ErrorPluginSingleton>().onError(
    { as: 'global' },
    ({ code, error, set, requestId = 'unknown' }) => {
      if (error instanceof AppError) {
        set.status = error.status
        return createErrorEnvelope({
          requestId,
          code: error.code,
          message: error.message,
          details: error.details,
        })
      }

      if (isDatabaseUnavailableError(error)) {
        set.status = 503
        return createErrorEnvelope({
          requestId,
          code: ErrorCodeEnum.DATABASE_UNAVAILABLE,
          message: 'Database unavailable',
        })
      }

      if (isDatabaseError(error)) {
        set.status = 500
        return createErrorEnvelope({
          requestId,
          code: ErrorCodeEnum.DATABASE_ERROR,
          message: 'Database operation failed',
        })
      }

      const mapped = mapFrameworkError(code)
      set.status = mapped.status

      return createErrorEnvelope({
        requestId,
        code: mapped.code,
        message: mapped.message,
      })
    },
  )
