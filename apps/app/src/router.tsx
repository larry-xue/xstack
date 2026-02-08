import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import App from './App'
import AuthPage from './routes/auth-page'
import TodosPage from './routes/todos-page'
import AuthenticatedLayout from './routes/authenticated-layout'
import { getSession } from './lib/auth'

const rootRoute = createRootRoute({
  component: App,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => {
    const session = await getSession()
    throw redirect({ to: session ? '/app/todos' : '/auth' })
  },
  component: () => null,
})

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: '/app/todos' })
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

const todosRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/todos',
  component: TodosPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  appRoute.addChildren([todosRoute]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  notFoundMode: 'fuzzy',
  notFoundComponent: () => (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
      <div className="card w-full text-center">
        <p className="text-sm font-semibold text-slate-500">404</p>
        <h1 className="mt-2 font-display text-2xl text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  ),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
