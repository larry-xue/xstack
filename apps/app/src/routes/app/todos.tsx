import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app/todos')({
  beforeLoad: () => {
    throw redirect({ to: '/app/tasks' })
  },
  component: () => null,
})
