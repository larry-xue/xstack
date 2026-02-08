import { Elysia, t } from 'elysia'
import type { AuthContext } from '../../plugins/auth'
import { errorResponse } from '../../schemas/error'
import { createTodoBody, todoResponse, updateTodoBody } from './schema'
import { todoService } from './service'

type AuthSingleton = {
  decorator: {}
  store: {}
  derive: { auth: AuthContext; requestId: string }
  resolve: {}
}

export const todoRoutes = new Elysia<'', AuthSingleton>()
  .get(
    '/todos',
    async ({ auth }) => {
      return todoService.list(auth.userId)
    },
    {
      response: {
        200: t.Array(todoResponse),
        401: errorResponse,
      },
    },
  )
  .post(
    '/todos',
    async ({ auth, body }) => {
      return todoService.create(auth.userId, body.title)
    },
    {
      body: createTodoBody,
      response: {
        200: todoResponse,
        401: errorResponse,
      },
    },
  )
  .patch(
    '/todos/:id',
    async ({ auth, params, body }) => {
      return todoService.update(auth.userId, params.id, body)
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: updateTodoBody,
      response: {
        200: todoResponse,
        400: errorResponse,
        401: errorResponse,
        404: errorResponse,
      },
    },
  )
  .delete(
    '/todos/:id',
    async ({ auth, params }) => {
      return todoService.delete(auth.userId, params.id)
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({ ok: t.Literal(true) }),
        401: errorResponse,
        404: errorResponse,
      },
    },
  )
