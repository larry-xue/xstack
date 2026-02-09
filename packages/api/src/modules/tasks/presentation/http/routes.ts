import { Elysia } from 'elysia'
import type { AuthPrincipal } from '../../../auth/application/ports/auth-provider'
import { toSuccessEnvelope } from '../../../../core/http/envelope'
import type { TaskUseCases } from '../../application/use-cases'
import {
  commonErrorSchema,
  createTaskBodySchema,
  deleteTaskSuccessSchema,
  listTasksSuccessSchema,
  taskParamsSchema,
  taskSuccessSchema,
  updateTaskBodySchema,
} from './schemas'

type AuthenticatedRequestSingleton = {
  decorator: {}
  store: {}
  derive: { auth: AuthPrincipal; requestId: string }
  resolve: {}
}

export const createTaskRoutes = (taskUseCases: TaskUseCases) =>
  new Elysia<'', AuthenticatedRequestSingleton>()
    .get(
      '/todos',
      async ({ auth, requestId }) =>
        toSuccessEnvelope(await taskUseCases.list(auth.userId), requestId),
      {
        detail: { tags: ['Todos'] },
        response: {
          200: listTasksSuccessSchema,
          401: commonErrorSchema,
          500: commonErrorSchema,
          503: commonErrorSchema,
        },
      },
    )
    .post(
      '/todos',
      async ({ auth, body, requestId }) =>
        toSuccessEnvelope(await taskUseCases.create(auth.userId, body.title), requestId),
      {
        detail: { tags: ['Todos'] },
        body: createTaskBodySchema,
        response: {
          200: taskSuccessSchema,
          400: commonErrorSchema,
          401: commonErrorSchema,
          500: commonErrorSchema,
          503: commonErrorSchema,
        },
      },
    )
    .patch(
      '/todos/:id',
      async ({ auth, params, body, requestId }) =>
        toSuccessEnvelope(await taskUseCases.update(auth.userId, params.id, body), requestId),
      {
        detail: { tags: ['Todos'] },
        params: taskParamsSchema,
        body: updateTaskBodySchema,
        response: {
          200: taskSuccessSchema,
          400: commonErrorSchema,
          401: commonErrorSchema,
          404: commonErrorSchema,
          500: commonErrorSchema,
          503: commonErrorSchema,
        },
      },
    )
    .delete(
      '/todos/:id',
      async ({ auth, params, requestId }) =>
        toSuccessEnvelope(await taskUseCases.delete(auth.userId, params.id), requestId),
      {
        detail: { tags: ['Todos'] },
        params: taskParamsSchema,
        response: {
          200: deleteTaskSuccessSchema,
          401: commonErrorSchema,
          404: commonErrorSchema,
          500: commonErrorSchema,
          503: commonErrorSchema,
        },
      },
    )
