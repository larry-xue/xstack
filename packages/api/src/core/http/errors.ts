export const ErrorCodeEnum = {
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

export type ErrorCode = (typeof ErrorCodeEnum)[keyof typeof ErrorCodeEnum]

export type ErrorEnvelope = {
  error: {
    code: ErrorCode
    message: string
    requestId: string
    details?: unknown
  }
}

type AppErrorParams = {
  code: ErrorCode
  status: number
  message: string
  details?: unknown
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly details?: unknown

  constructor(params: AppErrorParams) {
    super(params.message)
    this.code = params.code
    this.status = params.status
    this.details = params.details
    this.name = 'AppError'
  }
}

type CreateErrorEnvelopeParams = {
  code: ErrorCode
  message: string
  requestId: string
  details?: unknown
}

export const createErrorEnvelope = (params: CreateErrorEnvelopeParams): ErrorEnvelope => {
  const envelope: ErrorEnvelope = {
    error: {
      code: params.code,
      message: params.message,
      requestId: params.requestId,
    },
  }

  if (params.details !== undefined) {
    envelope.error.details = params.details
  }

  return envelope
}

type FrameworkErrorMapping = {
  status: number
  code: ErrorCode
  message: string
}

export const mapFrameworkError = (frameworkCode: string | number): FrameworkErrorMapping => {
  if (frameworkCode === 'VALIDATION') {
    return {
      status: 400,
      code: ErrorCodeEnum.VALIDATION_ERROR,
      message: 'Invalid request',
    }
  }

  if (frameworkCode === 'PARSE') {
    return {
      status: 400,
      code: ErrorCodeEnum.PARSE_ERROR,
      message: 'Malformed request',
    }
  }

  if (frameworkCode === 'NOT_FOUND') {
    return {
      status: 404,
      code: ErrorCodeEnum.ROUTE_NOT_FOUND,
      message: 'Not found',
    }
  }

  return {
    status: 500,
    code: ErrorCodeEnum.INTERNAL_ERROR,
    message: 'Internal server error',
  }
}

const asErrorLike = (value: unknown): { name?: string; code?: string; message?: string } | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  return value as { name?: string; code?: string; message?: string }
}

export const isDatabaseUnavailableError = (value: unknown): boolean => {
  const error = asErrorLike(value)
  if (!error) {
    return false
  }

  if (error.name === 'PrismaClientInitializationError') {
    return true
  }

  return error.code === 'P1001'
}

export const isDatabaseError = (value: unknown): boolean => {
  const error = asErrorLike(value)
  if (!error) {
    return false
  }

  if (isDatabaseUnavailableError(value)) {
    return true
  }

  return (
    error.name === 'PrismaClientKnownRequestError' ||
    error.name === 'PrismaClientUnknownRequestError' ||
    error.name === 'PrismaClientRustPanicError' ||
    error.name === 'PrismaClientValidationError'
  )
}
