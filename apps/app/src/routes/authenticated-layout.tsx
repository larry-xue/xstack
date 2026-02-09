import { useEffect, useMemo } from 'react'
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { spotlight } from '@mantine/spotlight'
import { FolderKanban, Home, Inbox, Search, Settings, SquareCheckBig } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CommandPalette } from '@/components/workspace/command-palette'
import { WorkspaceShell } from '@/components/workspace/workspace-shell'
import type { WorkspaceNavItem } from '@/components/workspace/workspace-sidebar'
import { useAuth } from '@/providers/auth'

const AuthenticatedLayout = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { session, isLoading, signOut } = useAuth()

  useEffect(() => {
    if (!isLoading && !session) {
      void navigate({ to: '/auth' })
    }
  }, [isLoading, navigate, session])

  const navItems = useMemo<WorkspaceNavItem[]>(
    () => [
      {
        key: 'home',
        label: t('shell.nav.home'),
        icon: Home,
        to: '/app/home',
      },
      {
        key: 'search',
        label: t('shell.nav.search'),
        icon: Search,
        onClick: () => {
          spotlight.open()
        },
      },
      {
        key: 'inbox',
        label: t('shell.nav.inbox'),
        icon: Inbox,
        to: '/app/inbox',
      },
      {
        key: 'tasks',
        label: t('shell.nav.tasks'),
        icon: SquareCheckBig,
        to: '/app/tasks',
      },
      {
        key: 'projects',
        label: t('shell.nav.projects'),
        icon: FolderKanban,
        to: '/app/projects',
      },
      {
        key: 'settings',
        label: t('shell.nav.settings'),
        icon: Settings,
        to: '/app/settings',
      },
    ],
    [t],
  )

  const pageTitleMap: Record<string, string> = {
    '/app/home': t('shell.nav.home'),
    '/app/inbox': t('shell.nav.inbox'),
    '/app/tasks': t('shell.nav.tasks'),
    '/app/projects': t('shell.nav.projects'),
    '/app/settings': t('shell.nav.settings'),
  }

  if (isLoading) {
    return null
  }

  if (!session) {
    return null
  }

  return (
    <>
      <CommandPalette />
      <WorkspaceShell
        title={pageTitleMap[pathname] ?? t('shell.workspaceLabel')}
        currentPath={pathname}
        navItems={navItems}
        onNavigate={(to) => {
          void navigate({ to })
        }}
        onSignOut={async () => {
          await signOut()
          await navigate({ to: '/auth' })
        }}
        email={session.user.email}
      >
        <Outlet />
      </WorkspaceShell>
    </>
  )
}

export default AuthenticatedLayout
