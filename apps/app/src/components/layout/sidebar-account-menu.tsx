import { ChevronUp, Languages, LogOut, Palette } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type SidebarAccountMenuProps = {
  email?: string
  collapsed?: boolean
  onSignOut: () => Promise<void> | void
}

const getDisplayName = (email?: string) => {
  if (!email) {
    return ''
  }
  return email.split('@')[0] ?? email
}

const getInitials = (value: string) => {
  const source = value.trim()
  if (!source) {
    return 'U'
  }
  return source.slice(0, 2).toUpperCase()
}

const SidebarAccountMenu = ({
  email,
  collapsed = false,
  onSignOut,
}: SidebarAccountMenuProps) => {
  const { t, i18n } = useTranslation()
  const { resolvedTheme, setTheme } = useTheme()
  const displayName = getDisplayName(email) || t('common.loading')
  const accountEmail = email ?? t('common.loading')
  const currentLanguage = i18n.resolvedLanguage?.startsWith('zh') ? 'zh-CN' : 'en'
  const currentTheme = resolvedTheme === 'dark' ? 'dark' : 'light'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid="sidebar-account-trigger"
          aria-label={t('authenticatedLayout.signedIn')}
          className={cn(
            'flex items-center rounded-lg border border-sidebar-border/70 bg-sidebar text-left',
            'text-sidebar-foreground transition hover:bg-sidebar-accent',
            collapsed ? 'mx-auto h-9 w-9 justify-center p-0' : 'w-full gap-2 px-2 py-1.5',
          )}
        >
          <Avatar className={cn('border border-sidebar-border/70', collapsed ? 'size-6' : 'size-[1.625rem]')}>
            <AvatarFallback className="bg-sidebar-accent text-[11px] font-semibold text-sidebar-foreground">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{displayName}</span>}
          {!collapsed && <ChevronUp className="size-3.5 text-sidebar-foreground/55" />}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align={collapsed ? 'end' : 'start'}
        sideOffset={6}
        data-testid="sidebar-account-menu"
        className="min-w-[216px] max-w-[228px] rounded-lg border border-sidebar-border/70 bg-sidebar p-0 text-sidebar-foreground shadow-lg"
      >
        <DropdownMenuLabel className="px-2.5 py-2.5">
          <div className="flex items-center gap-2">
            <Avatar className="size-7 border border-sidebar-border/70">
              <AvatarFallback className="bg-sidebar-accent text-[11px] font-semibold text-sidebar-foreground">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-[13px] leading-4 font-semibold text-sidebar-foreground">{displayName}</p>
              <p className="truncate text-[11px] leading-4 font-normal text-sidebar-foreground/62">{accountEmail}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="mx-0 my-0 bg-sidebar-border/70" />

        <div className="px-1.5 py-1.5">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="h-8 rounded-md px-2 text-[13px] leading-4 text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-foreground">
              <Palette className="size-3.5 text-sidebar-foreground/70" aria-hidden />
              {t('common.theme')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-32 rounded-md border border-sidebar-border/70 bg-sidebar p-1 text-sidebar-foreground">
              <DropdownMenuRadioGroup
                value={currentTheme}
                onValueChange={(value) => {
                  if (value === 'light' || value === 'dark') {
                    setTheme(value)
                  }
                }}
              >
                <DropdownMenuRadioItem
                  value="light"
                  className="h-8 rounded-sm text-[13px] leading-4 text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground"
                >
                  {t('common.themeLight')}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="dark"
                  className="h-8 rounded-sm text-[13px] leading-4 text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground"
                >
                  {t('common.themeDark')}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="mt-0.5 h-8 rounded-md px-2 text-[13px] leading-4 text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-foreground">
              <Languages className="size-3.5 text-sidebar-foreground/70" aria-hidden />
              {t('common.language')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-40 rounded-md border border-sidebar-border/70 bg-sidebar p-1 text-sidebar-foreground">
              <DropdownMenuRadioGroup
                value={currentLanguage}
                onValueChange={(value) => {
                  if (value === 'en' || value === 'zh-CN') {
                    void i18n.changeLanguage(value)
                  }
                }}
              >
                <DropdownMenuRadioItem
                  value="en"
                  className="h-8 rounded-sm text-[13px] leading-4 text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground"
                >
                  {t('common.languages.en')}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="zh-CN"
                  className="h-8 rounded-sm text-[13px] leading-4 text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground"
                >
                  {t('common.languages.zhCN')}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </div>

        <DropdownMenuSeparator className="mx-0 my-0 bg-sidebar-border/70" />

        <div className="px-1.5 py-1.5">
          <DropdownMenuItem
            className="h-8 rounded-md px-2 text-[13px] leading-4 text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground"
            onSelect={() => {
              void onSignOut()
            }}
          >
            <LogOut className="size-3.5" />
            {t('authenticatedLayout.signOut')}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SidebarAccountMenu
