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
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AppHeader from '@/components/layout/app-header'
import AppSidebar, { type AppSidebarItem } from '@/components/layout/app-sidebar'
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

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1480px] p-3 sm:p-4">
      <div className="flex min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-2xl border border-border/70 bg-card/75 shadow-soft-md backdrop-blur">
        <div className="hidden w-72 shrink-0 lg:block">
          <AppSidebar
            title={sidebarTitle}
            subtitle={sidebarSubtitle}
            sectionLabel={sidebarSection}
            items={navItems}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            title={t('authenticatedLayout.title')}
            subtitle={t('authenticatedLayout.subtitle')}
            searchPlaceholder={t('authenticatedLayout.searchPlaceholder')}
            signedInLabel={t('authenticatedLayout.signedIn')}
            userEmail={session?.user.email ?? t('common.loading')}
            signOutLabel={t('authenticatedLayout.signOut')}
            primaryActionLabel={t('authenticatedLayout.addNew')}
            notificationsLabel={t('authenticatedLayout.notifications')}
            filterLabel={t('authenticatedLayout.filter')}
            gridViewLabel={t('authenticatedLayout.gridView')}
            onSignOut={handleSignOut}
            leftSlot={
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
                    className="border-0"
                  />
                </SheetContent>
              </Sheet>
            }
          />

          <div className="flex items-center justify-end gap-3 border-b border-border/70 px-4 py-2.5 sm:px-6">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
            {isLoading ? (
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">
                  {t('authenticatedLayout.loadingSession')}
                </CardContent>
              </Card>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default AuthenticatedLayout
