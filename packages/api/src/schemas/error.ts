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
