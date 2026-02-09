import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { PanelLeftClose, PanelLeftOpen, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type AppSidebarItem = {
  key: string
  label: string
  icon: LucideIcon
  to?: string
  badge?: string
}

type SidebarNavListProps = {
  items: AppSidebarItem[]
  collapsed?: boolean
}

export const SidebarNavList = ({ items, collapsed = false }: SidebarNavListProps) => {
  return (
    <ul className="space-y-0" data-testid="sidebar-nav-list">
      {items.map((item) => {
        const Icon = item.icon
        const sharedClassName = cn(
          'inline-flex h-8 w-full rounded-md text-[13px] leading-5 font-medium transition-colors',
          collapsed ? 'justify-center px-0' : 'items-center gap-1.5 px-2',
        )

        if (!item.to) {
          return (
            <li key={item.key}>
              <div
                title={item.label}
                className={cn(
                  sharedClassName,
                  'cursor-not-allowed text-muted-foreground/60 opacity-70',
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className={cn(collapsed ? 'sr-only' : 'truncate')}>{item.label}</span>
                {!collapsed && item.badge && (
                  <Badge variant="secondary" className="ml-auto rounded-full px-1.5 text-[10px]">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </li>
          )
        }

        return (
          <li key={item.key}>
            <Link
              to={item.to}
              title={item.label}
              className={cn(
                sharedClassName,
                'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
              activeProps={{
                className:
                  'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
              }}
              inactiveProps={{
                className:
                  'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              }}
            >
              <Icon className="size-4 shrink-0" />
              <span className={cn(collapsed ? 'sr-only' : 'truncate')}>{item.label}</span>
              {!collapsed && item.badge && (
                <Badge
                  variant="secondary"
                  className="ml-auto rounded-full border-none bg-background/90 px-1.5 text-[10px] text-foreground/90"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export type AppSidebarProps = {
  title: string
  subtitle?: string
  sectionLabel?: string
  items: AppSidebarItem[]
  headerSlot?: ReactNode
  navSlot?: ReactNode
  footerSlot?: ReactNode
  collapsed?: boolean
  onToggleCollapsed?: () => void
  collapseLabel?: string
  className?: string
}

const AppSidebar = ({
  title,
  items,
  headerSlot,
  navSlot,
  footerSlot,
  collapsed = false,
  onToggleCollapsed,
  collapseLabel,
  className = '',
}: AppSidebarProps) => {
  const sidebarMonogram = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase())
    .join('')

  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col border-r border-sidebar-border/70 bg-sidebar text-sidebar-foreground',
        className,
      )}
    >
      {headerSlot ? (
        <div className={cn('h-14 border-b border-sidebar-border/70', collapsed ? 'px-1.5' : 'px-2')}>
          {headerSlot}
        </div>
      ) : (
        <div className={cn('h-14 border-b border-sidebar-border/70 px-2')}>
          <div className={cn('flex h-full items-center', collapsed ? 'justify-center' : 'justify-between gap-2')}>
            <div className={cn('flex min-w-0 items-center', collapsed ? 'justify-center' : 'gap-1.5')}>
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-[11px] font-semibold text-sidebar-foreground">
                {sidebarMonogram || 'XS'}
              </span>
              {!collapsed && (
                <span className="truncate text-[12px] font-semibold tracking-[0.08em] text-sidebar-foreground/85 uppercase">
                  {title}
                </span>
              )}
            </div>
            {onToggleCollapsed && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                data-testid="sidebar-toggle"
                aria-label={collapseLabel}
                title={collapseLabel}
                onClick={onToggleCollapsed}
              >
                {collapsed ? (
                  <PanelLeftOpen className="size-4" />
                ) : (
                  <PanelLeftClose className="size-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className={cn('flex-1', collapsed ? 'px-1.5 py-2' : 'px-2 py-2')}>
        {navSlot ? (
          navSlot
        ) : (
          <SidebarNavList items={items} collapsed={collapsed} />
        )}
      </div>

      {footerSlot && (
        <div className={cn('border-t border-sidebar-border/70', collapsed ? 'px-1.5 py-2' : 'px-2 py-2')}>
          {footerSlot}
        </div>
      )}
    </aside>
  )
}

export default AppSidebar
