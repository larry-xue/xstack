import { t } from 'elysia'

export const todoResponse = t.Object({
  id: t.String(),
  title: t.String(),
  isDone: t.Boolean(),
  createdAt: t.String(),
  updatedAt: t.String(),
})

export const createTodoBody = t.Object({
  title: t.String({ minLength: 1, maxLength: 200 }),
})

export const updateTodoBody = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
  isDone: t.Optional(t.Boolean()),
})
