import type { ReactNode } from 'react'
import AppHeader, { type AppHeaderProps } from '@/components/layout/app-header'
import AppSidebar, { type AppSidebarItem } from '@/components/layout/app-sidebar'
import { cn } from '@/lib/utils'

export type AppShellSlots = {
  sidebarNav?: ReactNode
  sidebarFooter?: ReactNode
  headerStart?: ReactNode
  headerEnd?: ReactNode
}

export type AppShellProps = {
  sidebar: {
    title: string
    subtitle?: string
    sectionLabel?: string
    items: AppSidebarItem[]
  }
  header: Omit<AppHeaderProps, 'startSlot' | 'endSlot' | 'dataTestId'>
  sidebarCollapsed?: boolean
  onSidebarToggle?: () => void
  sidebarToggleLabel?: string
  slots?: AppShellSlots
  children: ReactNode
}

const AppShell = ({
  sidebar,
  header,
  sidebarCollapsed = false,
  onSidebarToggle,
  sidebarToggleLabel,
  slots,
  children,
}: AppShellProps) => {
  return (
    <div
      className="h-dvh w-screen overflow-hidden bg-background text-foreground"
      data-testid="app-shell-root"
    >
      <div className="flex h-full w-full">
        <div
          className={cn(
            'hidden h-full shrink-0 lg:block',
            sidebarCollapsed ? 'w-16' : 'w-60',
          )}
          data-testid="app-shell-sidebar"
          data-collapsed={sidebarCollapsed ? 'true' : 'false'}
        >
          <AppSidebar
            title={sidebar.title}
            subtitle={sidebar.subtitle}
            sectionLabel={sidebar.sectionLabel}
            items={sidebar.items}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={onSidebarToggle}
            collapseLabel={sidebarToggleLabel}
            navSlot={slots?.sidebarNav}
            footerSlot={slots?.sidebarFooter}
          />
        </div>

        <div className="[--app-content-max:1120px] [--app-content-x:1.25rem] lg:[--app-content-x:1.5rem] flex min-w-0 flex-1 flex-col bg-background">
          <AppHeader
            {...header}
            startSlot={slots?.headerStart}
            endSlot={slots?.headerEnd}
            dataTestId="app-shell-header"
          />

          <main
            className="min-h-0 flex-1 overflow-y-auto px-[var(--app-content-x)] py-5 lg:py-6"
            data-testid="app-shell-main"
          >
            <div className="mx-auto w-full max-w-[var(--app-content-max)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppShell
