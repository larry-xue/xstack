import { useEffect } from 'react'
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
  UserRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AppShell, { type AppShellSlots } from '@/components/layout/app-shell'
import AppSidebar, { SidebarNavList, type AppSidebarItem } from '@/components/layout/app-sidebar'
import LanguageSwitcher from '@/components/language-switcher'
import ThemeToggle from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '../providers/auth'

const AuthenticatedLayout = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { session, isLoading, signOut } = useAuth()
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

  const sidebarTitle = t('authenticatedLayout.title')
  const sidebarSubtitle = t('authenticatedLayout.brand')
  const sidebarSection = t('authenticatedLayout.navigation')

  const renderSidebarNav = () => (
    <>
      <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/60">
        {sidebarSection}
      </p>
      <SidebarNavList items={navItems} />
    </>
  )

  const renderSidebarFooter = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
      <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-3">
        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-sidebar-foreground/70" aria-hidden />
          <p className="truncate text-sm font-semibold text-sidebar-foreground">
            {session?.user.email ?? t('common.loading')}
          </p>
        </div>
        <Button className="mt-3 w-full" variant="outline" onClick={handleSignOut}>
          {t('authenticatedLayout.signOut')}
        </Button>
      </div>
    </div>
  )

  const appShellSlots: AppShellSlots = {
    sidebarNav: renderSidebarNav(),
    sidebarFooter: renderSidebarFooter(),
    headerStart: (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            className="lg:hidden"
            aria-label={t('authenticatedLayout.openNavigation')}
          >
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{sidebarTitle}</SheetTitle>
            <SheetDescription>{t('authenticatedLayout.openNavigation')}</SheetDescription>
          </SheetHeader>
          <AppSidebar
            title={sidebarTitle}
            subtitle={sidebarSubtitle}
            sectionLabel={sidebarSection}
            items={navItems}
            navSlot={renderSidebarNav()}
            footerSlot={renderSidebarFooter()}
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
        subtitle: sidebarSubtitle,
        sectionLabel: sidebarSection,
        items: navItems,
      }}
      header={{
        title: t('authenticatedLayout.nav.todos'),
      }}
      slots={appShellSlots}
    >
      {isLoading ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            {t('authenticatedLayout.loadingSession')}
          </CardContent>
        </Card>
      ) : (
        <Outlet />
      )}
    </AppShell>
  )
}

export default AuthenticatedLayout
