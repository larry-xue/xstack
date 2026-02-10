import { Elysia } from 'elysia'
import type { AuthPrincipal } from '@api/modules/auth/application/ports/auth-provider'
import { toSuccessEnvelope } from '@api/core/http/envelope'
import type { TaskUseCases } from '@api/modules/tasks/application/use-cases'
import { withTaskListDefaults } from '@api/modules/tasks/domain/task'
import {
  actionSuccessSchema,
  commonErrorSchema,
  createTaskBodySchema,
  listTasksSuccessSchema,
  taskListQuerySchema,
  taskParamsSchema,
  taskSuccessSchema,
  updateTaskBodySchema,
} from '@api/modules/tasks/presentation/http/schemas'

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
      async ({ auth, query, requestId }) =>
        toSuccessEnvelope(
          await taskUseCases.list(auth.userId, withTaskListDefaults(query)),
          requestId,
        ),
      {
        detail: { tags: ['Todos'] },
        query: taskListQuerySchema,
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
          200: actionSuccessSchema,
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
          200: actionSuccessSchema,
          401: commonErrorSchema,
          404: commonErrorSchema,
          500: commonErrorSchema,
          503: commonErrorSchema,
        },
      },
    )
