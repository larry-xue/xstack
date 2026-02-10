import { t } from 'elysia'
import type { TSchema } from 'elysia'
import { ErrorCodeEnum } from '@api/core/http/errors'

export type SuccessEnvelope<T> = {
  data: T
  meta: {
    requestId: string
  }
}

export const responseMetaSchema = t.Object({
  requestId: t.String(),
})

export const makeSuccessEnvelopeSchema = <TDataSchema extends TSchema>(dataSchema: TDataSchema) =>
  t.Object({
    data: dataSchema,
    meta: responseMetaSchema,
  })

export const errorEnvelopeSchema = t.Object({
  error: t.Object({
    code: t.Enum(ErrorCodeEnum),
    message: t.String(),
    requestId: t.String(),
    details: t.Optional(t.Any()),
  }),
})

export const toSuccessEnvelope = <T>(data: T, requestId: string): SuccessEnvelope<T> => ({
  data,
  meta: {
    requestId,
  },
})
