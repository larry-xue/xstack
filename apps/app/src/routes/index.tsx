import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '@/lib/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getSession()
    throw redirect({ to: session ? '/app/home' : '/auth' })
  },
  component: () => null,
})
