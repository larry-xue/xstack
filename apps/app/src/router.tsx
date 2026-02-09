import { Alert, Button, Center, Paper, Stack, Text, Title } from '@mantine/core'
import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import App from './App'
import { getSession } from './lib/auth'
import AuthPage from './routes/auth-page'
import AuthenticatedLayout from './routes/authenticated-layout'
import HomePage from './routes/home-page'
import InboxPage from './routes/inbox-page'
import ProjectsPage from './routes/projects-page'
import SettingsPage from './routes/settings-page'
import TasksPage from './routes/tasks-page'

const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <Center mih="100vh" px="md">
      <Paper withBorder radius="sm" p={26} w="100%" maw={500} bg="var(--app-surface)">
        <Stack gap={8}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            {t('router.notFound.code')}
          </Text>
          <Title order={2} fw={600}>
            {t('router.notFound.title')}
          </Title>
          <Text c="dimmed">{t('router.notFound.description')}</Text>
          <Alert color="gray" variant="light">
            {t('router.notFound.hint')}
          </Alert>
          <Button component="a" href="/app/home" variant="light" w="fit-content">
            {t('router.notFound.backHome')}
          </Button>
        </Stack>
      </Paper>
    </Center>
  )
}

const rootRoute = createRootRoute({
  component: App,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => {
    const session = await getSession()
    throw redirect({ to: session ? '/app/home' : '/auth' })
  },
  component: () => null,
})

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: '/app/home' })
    }
  },
  component: AuthPage,
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/auth' })
    }
  },
  component: AuthenticatedLayout,
})

const appIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  component: () => null,
  beforeLoad: () => {
    throw redirect({ to: '/app/home' })
  },
})

const homeRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/home',
  component: HomePage,
})

const inboxRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/inbox',
  component: InboxPage,
})

const tasksRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/tasks',
  component: TasksPage,
})

const projectsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/projects',
  component: ProjectsPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/settings',
  component: SettingsPage,
})

const todosCompatRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/todos',
  component: () => null,
  beforeLoad: () => {
    throw redirect({ to: '/app/tasks' })
  },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  appRoute.addChildren([
    appIndexRoute,
    homeRoute,
    inboxRoute,
    tasksRoute,
    projectsRoute,
    settingsRoute,
    todosCompatRoute,
  ]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  notFoundMode: 'fuzzy',
  defaultNotFoundComponent: NotFoundPage,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
