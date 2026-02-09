import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
}

export const SidebarNavList = ({ items }: SidebarNavListProps) => {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => {
        const Icon = item.icon
        const sharedClassName =
          'inline-flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors'

        if (!item.to) {
          return (
            <li key={item.key}>
              <div
                className={cn(
                  sharedClassName,
                  'cursor-not-allowed text-muted-foreground/60 opacity-70',
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto rounded-full text-[10px]">
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
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className="ml-auto rounded-full border-none bg-background/80 text-[10px] text-foreground/90"
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

type AppSidebarProps = {
  title: string
  subtitle: string
  sectionLabel: string
  items: AppSidebarItem[]
  className?: string
}

const AppSidebar = ({
  title,
  subtitle,
  sectionLabel,
  items,
  className = '',
}: AppSidebarProps) => {
  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        className,
      )}
    >
      <div className="border-b border-sidebar-border px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/60">
          {subtitle}
        </p>
        <h1 className="mt-1 font-display text-lg text-sidebar-foreground">{title}</h1>
      </div>

      <div className="flex-1 px-3 py-4">
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/60">
          {sectionLabel}
        </p>
        <SidebarNavList items={items} />
      </div>
    </aside>
  )
}

export default AppSidebar

