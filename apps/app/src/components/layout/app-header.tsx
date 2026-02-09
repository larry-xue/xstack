import type { ReactNode } from 'react'
import { Bell, Grid2x2, ListFilter, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type AppHeaderProps = {
  title: string
  subtitle: string
  searchPlaceholder: string
  signedInLabel: string
  userEmail: string
  signOutLabel: string
  primaryActionLabel: string
  notificationsLabel: string
  filterLabel: string
  gridViewLabel: string
  onSignOut: () => Promise<void> | void
  leftSlot?: ReactNode
}

const AppHeader = ({
  title,
  subtitle,
  searchPlaceholder,
  signedInLabel,
  userEmail,
  signOutLabel,
  primaryActionLabel,
  notificationsLabel,
  filterLabel,
  gridViewLabel,
  onSignOut,
  leftSlot,
}: AppHeaderProps) => {
  return (
    <header className="border-b border-border/80 bg-card/80 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {leftSlot}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {subtitle}
            </p>
            <h2 className="font-display text-2xl leading-tight text-foreground">{title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" aria-label={notificationsLabel}>
            <Bell className="size-4" />
          </Button>
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground">{signedInLabel}</p>
            <p className="max-w-[220px] truncate text-sm font-semibold text-foreground">{userEmail}</p>
          </div>
          <Button variant="outline" onClick={onSignOut}>
            {signOutLabel}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input placeholder={searchPlaceholder} className="h-10 sm:flex-1" />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" aria-label={filterLabel}>
            <ListFilter className="size-4" />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label={gridViewLabel}>
            <Grid2x2 className="size-4" />
          </Button>
          <Button>
            <Plus className="size-4" />
            {primaryActionLabel}
          </Button>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
