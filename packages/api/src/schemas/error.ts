import { t } from 'elysia'

export const ErrorCodeEnum = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  TODO_NOT_FOUND: 'TODO_NOT_FOUND',
  NO_UPDATES: 'NO_UPDATES',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ErrorCode = (typeof ErrorCodeEnum)[keyof typeof ErrorCodeEnum]

export const errorResponse = t.Object({
  error: t.String(),
  code: t.Enum(ErrorCodeEnum),
  requestId: t.String(),
})

export const buildError = (params: {
  requestId: string
  code: ErrorCode
  error: string
}) => ({
  error: params.error,
  code: params.code,
  requestId: params.requestId,
})

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status: number

  constructor(params: { code: ErrorCode; status: number; message: string }) {
    super(params.message)
    this.code = params.code
    this.status = params.status
    this.name = 'AppError'
  }
}

export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError
