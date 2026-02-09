import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from '@tanstack/react-router'
import {
  AreaChart,
  Boxes,
  Bot,
  FolderKanban,
  Globe,
  LayoutGrid,
  ListChecks,
  Menu,
  Server,
  ShieldCheck,
  Store,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SidebarAccountMenu from '@/components/layout/sidebar-account-menu'
import AppShell, { type AppShellSlots } from '@/components/layout/app-shell'
import AppSidebar, { SidebarNavList, type AppSidebarItem } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '../providers/auth'

const AuthenticatedLayout = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { session, isLoading, signOut } = useAuth()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const navItems: AppSidebarItem[] = [
    {
      key: 'overview',
      label: t('authenticatedLayout.nav.overview'),
      icon: LayoutGrid,
    },
    {
      key: 'projects',
      label: t('authenticatedLayout.nav.projects'),
      icon: FolderKanban,
    },
    {
      key: 'deployments',
      label: t('authenticatedLayout.nav.deployments'),
      icon: Boxes,
    },
    {
      key: 'analytics',
      label: t('authenticatedLayout.nav.analytics'),
      icon: AreaChart,
    },
    {
      key: 'observability',
      label: t('authenticatedLayout.nav.observability'),
      icon: ShieldCheck,
    },
    {
      key: 'domains',
      label: t('authenticatedLayout.nav.domains'),
      icon: Globe,
    },
    {
      key: 'integrations',
      label: t('authenticatedLayout.nav.integrations'),
      icon: Store,
    },
    {
      key: 'ai-gateway',
      label: t('authenticatedLayout.nav.aiGateway'),
      icon: Bot,
    },
    {
      key: 'sandboxes',
      label: t('authenticatedLayout.nav.sandboxes'),
      icon: Server,
    },
    {
      key: 'todos',
      label: t('authenticatedLayout.nav.todos'),
      icon: ListChecks,
      to: '/app/todos',
      badge: t('authenticatedLayout.nav.live'),
    },
  ]

  useEffect(() => {
    if (!isLoading && !session) {
      navigate({ to: '/auth' })
    }
  }, [isLoading, navigate, session])

  const handleSignOut = async () => {
    await signOut()
    await navigate({ to: '/auth' })
  }

  const sidebarTitle = t('authenticatedLayout.brand')

  const renderSidebarFooter = () => (
    <SidebarAccountMenu
      email={session?.user.email}
      collapsed={isSidebarCollapsed}
      onSignOut={handleSignOut}
    />
  )

  const appShellSlots: AppShellSlots = {
    sidebarFooter: renderSidebarFooter(),
    headerStart: (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="lg:hidden"
            aria-label={t('authenticatedLayout.openNavigation')}
          >
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{sidebarTitle}</SheetTitle>
            <SheetDescription>{t('authenticatedLayout.openNavigation')}</SheetDescription>
          </SheetHeader>
          <AppSidebar
            title={sidebarTitle}
            items={navItems}
            navSlot={<SidebarNavList items={navItems} />}
            footerSlot={
              <SidebarAccountMenu email={session?.user.email} collapsed={false} onSignOut={handleSignOut} />
            }
            className="border-0"
          />
        </SheetContent>
      </Sheet>
    ),
  }

  return (
    <AppShell
      sidebar={{
        title: sidebarTitle,
        items: navItems,
      }}
      header={{
        title: t('authenticatedLayout.nav.todos'),
      }}
      sidebarCollapsed={isSidebarCollapsed}
      onSidebarToggle={() => setIsSidebarCollapsed((prev) => !prev)}
      sidebarToggleLabel={t('authenticatedLayout.toggleSidebar')}
      slots={appShellSlots}
    >
      {isLoading ? (
        <div className="py-6 text-sm text-muted-foreground">{t('authenticatedLayout.loadingSession')}</div>
      ) : (
        <Outlet />
      )}
    </AppShell>
  )
}

export default AuthenticatedLayout
