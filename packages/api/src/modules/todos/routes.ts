import { Elysia, t } from 'elysia'
import type { AuthContext } from '../../plugins/auth'
import { todoService } from './service'
import { createTodoBody, errorResponse, todoResponse, updateTodoBody } from './schema'

type AuthSingleton = {
  decorator: {}
  store: {}
  derive: { auth: AuthContext | null }
  resolve: {}
}

export const todoRoutes = new Elysia<'', AuthSingleton>()
  .get(
    '/todos',
    async ({ auth }) => {
      return todoService.list(auth!.userId)
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
      return todoService.create(auth!.userId, body.title)
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
    async ({ auth, set, params, body }) => {
      const result = await todoService.update(auth!.userId, params.id, body)
      if ('error' in result) {
        set.status = result.status
        return { error: result.error }
      }
      return result
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
    async ({ auth, set, params }) => {
      const result = await todoService.delete(auth!.userId, params.id)
      if ('error' in result) {
        set.status = result.status
        return { error: result.error }
      }
      return result
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
