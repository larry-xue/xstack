import { t } from 'elysia'
import { errorEnvelopeSchema, makeSuccessEnvelopeSchema } from '@api/core/http/envelope'
import { TaskSortByEnum, TaskSortOrderEnum, TaskStatusFilterEnum } from '@api/modules/tasks/domain/task'

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

export const updateTaskBodySchema = t.Object(
  {
    title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
    isDone: t.Optional(t.Boolean()),
  },
  { minProperties: 1 },
)

export const taskListQuerySchema = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  sortBy: t.Optional(t.Enum(TaskSortByEnum)),
  sortOrder: t.Optional(t.Enum(TaskSortOrderEnum)),
  status: t.Optional(t.Enum(TaskStatusFilterEnum)),
})

export const taskParamsSchema = t.Object({
  id: t.String(),
})

export const taskListDataSchema = t.Object({
  items: t.Array(taskSchema),
  total: t.Number({ minimum: 0 }),
  page: t.Number({ minimum: 1 }),
  pageSize: t.Number({ minimum: 1 }),
  totalPages: t.Number({ minimum: 1 }),
  sortBy: t.Enum(TaskSortByEnum),
  sortOrder: t.Enum(TaskSortOrderEnum),
  status: t.Enum(TaskStatusFilterEnum),
})

export const listTasksSuccessSchema = makeSuccessEnvelopeSchema(taskListDataSchema)
export const taskSuccessSchema = makeSuccessEnvelopeSchema(taskSchema)
export const actionSuccessSchema = makeSuccessEnvelopeSchema(
  t.Object({
    ok: t.Literal(true),
  }),
)
export const commonErrorSchema = errorEnvelopeSchema
