import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import { createAppContainer, type AppContainer } from '@api/bootstrap/create-container'
import { createAuthGuardPlugin } from '@api/core/plugins/auth-guard'
import { createErrorPlugin } from '@api/core/plugins/error-handler'
import { createRequestContextPlugin } from '@api/core/plugins/request-context'
import { createSystemRoutes } from '@api/modules/system/presentation/http/routes'
import { createTaskRoutes } from '@api/modules/tasks/presentation/http/routes'

type ElysiaOptions = NonNullable<ConstructorParameters<typeof Elysia>[0]>

type CreateAppOptions = Pick<ElysiaOptions, 'adapter'> & {
  container?: AppContainer
}

export const createApp = (options?: CreateAppOptions) => {
  const container = options?.container ?? createAppContainer()

  return new Elysia({
    adapter: options?.adapter,
  })
    .use(
      openapi({
        path: '/openapi',
        specPath: '/openapi/json',
        documentation: {
          info: {
            title: 'XStack API',
            version: '1.0.0',
            description: 'Starter backend API for XStack.',
          },
          tags: [
            { name: 'System', description: 'Service diagnostics and health' },
            { name: 'Todos', description: 'Authenticated todo endpoints' },
          ],
        },
      }),
    )
    .use(createRequestContextPlugin(container.logger))
    .use(createErrorPlugin(container.logger))
    .onStop(async () => {
      await container.dispose()
    })
    .use(createSystemRoutes())
    .group('/api/v1', app =>
      app
        .use(createAuthGuardPlugin(container.authProvider))
        .use(createTaskRoutes(container.taskUseCases)),
    )
}

export type App = ReturnType<typeof createApp>
