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
        ),
    )

export type App = ReturnType<typeof createApp>
