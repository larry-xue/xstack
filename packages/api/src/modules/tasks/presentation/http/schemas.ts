import { t } from 'elysia'
import { errorEnvelopeSchema, makeSuccessEnvelopeSchema } from '../../../../core/http/envelope'

export const taskSchema = t.Object({
  id: t.String(),
  title: t.String(),
  isDone: t.Boolean(),
  createdAt: t.String(),
  updatedAt: t.String(),
})

export const createTaskBodySchema = t.Object({
  title: t.String({ minLength: 1, maxLength: 200 }),
})

export const updateTaskBodySchema = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
  isDone: t.Optional(t.Boolean()),
})

export const taskParamsSchema = t.Object({
  id: t.String(),
})

export const listTasksSuccessSchema = makeSuccessEnvelopeSchema(t.Array(taskSchema))
export const taskSuccessSchema = makeSuccessEnvelopeSchema(taskSchema)
export const deleteTaskSuccessSchema = makeSuccessEnvelopeSchema(
  t.Object({
    ok: t.Literal(true),
  }),
)
export const commonErrorSchema = errorEnvelopeSchema
