import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import { disconnectPrisma } from './prisma'
import { rootRoutes } from './routes/root'
import { todoRoutes } from './modules/todos/routes'
import { authGuard, authPlugin } from './plugins/auth'
import { errorPlugin } from './plugins/error'
import { requestContextPlugin } from './plugins/request-context'

type ElysiaOptions = NonNullable<ConstructorParameters<typeof Elysia>[0]>

type CreateAppOptions = Pick<ElysiaOptions, 'adapter'>

export const createApp = (options?: CreateAppOptions) =>
  new Elysia(options)
    .use(openapi())
    .use(requestContextPlugin)
    .use(errorPlugin)
    .onStop(async () => {
      await disconnectPrisma()
    })
    .use(rootRoutes)
    .group('/api', (app) => app.use(authPlugin).use(authGuard).use(todoRoutes))

export type App = ReturnType<typeof createApp>
