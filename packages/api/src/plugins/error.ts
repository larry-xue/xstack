import { Elysia } from 'elysia'
import { AppError, buildError, type ErrorCode } from '../schemas/error'

const isProduction = process.env.NODE_ENV === 'production'

type ErrorResult = {
  error: string
  code: ErrorCode
}

const toErrorResult = (code: string | number): ErrorResult => {
  if (code === 'VALIDATION') {
    return { error: 'Invalid request', code: 'VALIDATION_ERROR' }
  }

  if (code === 'PARSE') {
    return { error: 'Malformed request', code: 'PARSE_ERROR' }
  }

  if (code === 'NOT_FOUND') {
    return { error: 'Not found', code: 'NOT_FOUND' }
  }

  return { error: 'Internal server error', code: 'INTERNAL_ERROR' }
}

type ErrorSingleton = {
  decorator: {}
  store: {}
  derive: { requestId: string }
  resolve: {}
}

export const errorPlugin = new Elysia<'', ErrorSingleton>().onError(
  { as: 'global' },
  ({ code, error, set, requestId = 'unknown' }) => {
    if (!isProduction) {
      console.error(error)
    }

    if (error instanceof AppError) {
      set.status = error.status
      return buildError({
        requestId,
        code: error.code,
        error: error.message,
      })
    }

    const result = toErrorResult(code)

    if (code === 'VALIDATION' || code === 'PARSE') {
      set.status = 400
    } else if (code === 'NOT_FOUND') {
      set.status = 404
    } else {
      set.status = 500
    }

    return buildError({
      requestId,
      code: result.code,
      error: result.error,
    })
  },
)
