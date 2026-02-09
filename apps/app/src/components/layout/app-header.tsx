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
      className="border-b border-border/80 bg-card/80 px-4 py-4 backdrop-blur sm:px-6"
      data-testid={dataTestId}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {startSlot}
          <div>
            {subtitle && (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {subtitle}
              </p>
            )}
            <h2 className="font-display text-2xl leading-tight text-foreground">
              {title}
            </h2>
          </div>
        </div>

        {endSlot && <div>{endSlot}</div>}
      </div>
    </header>
  )
}

export default AppHeader
