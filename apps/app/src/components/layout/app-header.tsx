import type { ReactNode } from 'react'

export type AppHeaderProps = {
  title: string
  subtitle?: string
  startSlot?: ReactNode
  endSlot?: ReactNode
  dataTestId?: string
}

const AppHeader = ({
  title,
  subtitle,
  startSlot,
  endSlot,
  dataTestId,
}: AppHeaderProps) => {
  return (
    <header
      className="border-b border-border bg-background"
      data-testid={dataTestId}
    >
      <div className="px-[var(--app-content-x)]">
        <div className="mx-auto flex min-h-14 w-full max-w-[var(--app-content-max)] items-center justify-between gap-3 py-2">
          <div className="flex min-w-0 items-center">
            {startSlot && <div className="shrink-0">{startSlot}</div>}
            <div className={`min-w-0 ${startSlot ? 'ml-2 lg:ml-0' : ''}`}>
              {subtitle && (
                <p className="text-[11px] leading-4 font-medium text-muted-foreground">
                  {subtitle}
                </p>
              )}
              <h2 className="truncate font-display text-[2rem] leading-tight tracking-tight text-foreground">
                {title}
              </h2>
            </div>
          </div>

          {endSlot && <div className="shrink-0">{endSlot}</div>}
        </div>
      </div>
    </header>
  )
}

export default AppHeader
