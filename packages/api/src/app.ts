import { openapi } from '@elysiajs/openapi'
import { Elysia, t } from 'elysia'
import { getBearerToken, verifySupabaseJwt } from './auth.js'
import { disconnectPrisma, getPrisma } from './prisma.js'

type ElysiaOptions = NonNullable<ConstructorParameters<typeof Elysia>[0]>
type CreateAppOptions = Pick<ElysiaOptions, 'adapter'>

const todoResponse = t.Object({
  id: t.String(),
  title: t.String(),
  isDone: t.Boolean(),
  createdAt: t.String(),
  updatedAt: t.String(),
})
const errorResponse = t.Object({
  error: t.String(),
})

const formatTodo = (todo: {
  id: string
  title: string
  isDone: boolean
  createdAt: Date
  updatedAt: Date
}) => ({
  id: todo.id,
  title: todo.title,
  isDone: todo.isDone,
  createdAt: todo.createdAt.toISOString(),
  updatedAt: todo.updatedAt.toISOString(),
})

const authGuard = new Elysia()
  .derive({ as: 'scoped' }, async ({ request }) => {
    const token = getBearerToken(request)
    if (!token) {
      return { auth: null }
    }

    try {
      const auth = await verifySupabaseJwt(token)
      return { auth }
    } catch {
      return { auth: null }
    }
  })
  .onBeforeHandle(({ auth, set }) => {
    if (!auth) {
      set.status = 401
      return { error: 'Unauthorized' }
    }
  })

export const createApp = (options?: CreateAppOptions) =>
  new Elysia(options)
    .use(openapi())
    .onStop(async () => {
      await disconnectPrisma()
    })
    .get(
      '/',
      () => ({ service: 'api', status: 'ok' } as const),
      {
        response: {
          200: t.Object({
            service: t.Literal('api'),
            status: t.Literal('ok'),
          }),
        },
      },
    )
    .get(
      '/health',
      () => ({ ok: true } as const),
      {
        response: {
          200: t.Object({
            ok: t.Literal(true),
          }),
        },
      },
    )
    .group('/api', (app) =>
      app
        .use(authGuard)
        .get(
          '/todos',
          async ({ auth }) => {
            const todos = await getPrisma().todo.findMany({
              where: { userId: auth!.userId },
              orderBy: { createdAt: 'desc' },
            })

            return todos.map(formatTodo)
          },
          {
            response: {
              200: t.Array(todoResponse),
            },
          },
        )
        .post(
          '/todos',
          async ({ auth, body }) => {
            const todo = await getPrisma().todo.create({
              data: {
                userId: auth!.userId,
                title: body.title,
              },
            })

            return formatTodo(todo)
          },
          {
            body: t.Object({
              title: t.String({ minLength: 1, maxLength: 200 }),
            }),
            response: {
              200: todoResponse,
            },
          },
        )
        .patch(
          '/todos/:id',
          async ({ auth, params, body, set }) => {
            const existing = await getPrisma().todo.findFirst({
              where: { id: params.id, userId: auth!.userId },
            })

            if (!existing) {
              set.status = 404
              return { error: 'Todo not found' }
            }

            const update: { title?: string; isDone?: boolean; updatedAt?: Date } =
              {}
            if (typeof body.title === 'string') {
              update.title = body.title
            }
            if (typeof body.isDone === 'boolean') {
              update.isDone = body.isDone
            }

            if (Object.keys(update).length === 0) {
              set.status = 400
              return { error: 'No updates provided' }
            }

            update.updatedAt = new Date()

            const todo = await getPrisma().todo.update({
              where: { id: existing.id },
              data: update,
            })

            return formatTodo(todo)
          },
          {
            params: t.Object({
              id: t.String(),
            }),
            body: t.Object({
              title: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
              isDone: t.Optional(t.Boolean()),
            }),
            response: {
              200: todoResponse,
              400: errorResponse,
              404: errorResponse,
            },
          },
        )
        .delete(
          '/todos/:id',
          async ({ auth, params, set }) => {
            const result = await getPrisma().todo.deleteMany({
              where: { id: params.id, userId: auth!.userId },
            })

            if (result.count === 0) {
              set.status = 404
              return { error: 'Todo not found' }
            }

            return { ok: true }
          },
          {
            params: t.Object({
              id: t.String(),
            }),
            response: {
              200: t.Object({ ok: t.Literal(true) }),
              404: errorResponse,
            },
          },
        ),
    )

export type App = ReturnType<typeof createApp>
