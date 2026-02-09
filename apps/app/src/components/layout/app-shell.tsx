import type { ReactNode } from 'react'
import AppHeader, { type AppHeaderProps } from '@/components/layout/app-header'
import AppSidebar, { type AppSidebarItem } from '@/components/layout/app-sidebar'

export type AppShellSlots = {
  sidebarNav?: ReactNode
  sidebarFooter?: ReactNode
  headerStart?: ReactNode
  headerEnd?: ReactNode
}

export type AppShellProps = {
  sidebar: {
    title: string
    subtitle: string
    sectionLabel: string
    items: AppSidebarItem[]
  }
  header: Omit<AppHeaderProps, 'startSlot' | 'endSlot' | 'dataTestId'>
  slots?: AppShellSlots
  children: ReactNode
}

const AppShell = ({ sidebar, header, slots, children }: AppShellProps) => {
  return (
    <div className="h-dvh w-screen overflow-hidden" data-testid="app-shell-root">
      <div className="flex h-full w-full">
        <div className="hidden h-full w-72 shrink-0 lg:block" data-testid="app-shell-sidebar">
          <AppSidebar
            title={sidebar.title}
            subtitle={sidebar.subtitle}
            sectionLabel={sidebar.sectionLabel}
            items={sidebar.items}
            navSlot={slots?.sidebarNav}
            footerSlot={slots?.sidebarFooter}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            {...header}
            startSlot={slots?.headerStart}
            endSlot={slots?.headerEnd}
            dataTestId="app-shell-header"
          />

          <main
            className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8"
            data-testid="app-shell-main"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppShell
