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

const SidebarAccountMenu = ({ email, onSignOut }: SidebarAccountMenuProps) => {
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
            'flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar px-2.5 py-2 text-left',
            'text-sidebar-foreground transition hover:bg-sidebar-accent',
          )}
        >
          <Avatar className="size-7 border border-sidebar-border">
            <AvatarFallback className="bg-sidebar-accent text-[11px] font-semibold text-sidebar-foreground">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{displayName}</span>
          <ChevronUp className="size-4 text-sidebar-foreground/60" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        data-testid="sidebar-account-menu"
        className="w-[--radix-dropdown-menu-trigger-width] min-w-[250px] rounded-xl border-sidebar-border bg-sidebar p-0 text-sidebar-foreground shadow-xl"
      >
        <DropdownMenuLabel className="px-3 py-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="size-8 border border-sidebar-border">
              <AvatarFallback className="bg-sidebar-accent text-xs font-semibold text-sidebar-foreground">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">{displayName}</p>
              <p className="truncate text-xs font-normal text-sidebar-foreground/65">{accountEmail}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="mx-0 my-0 bg-sidebar-border" />

        <div className="px-2 py-2">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="h-9 rounded-md px-2 text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-foreground">
              <Palette className="size-4 text-sidebar-foreground/70" aria-hidden />
              {t('common.theme')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-36 rounded-md border-sidebar-border bg-sidebar p-1 text-sidebar-foreground">
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
                  className="rounded-sm text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground"
                >
                  {t('common.themeLight')}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="dark"
                  className="rounded-sm text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground"
                >
                  {t('common.themeDark')}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="mt-1 h-9 rounded-md px-2 text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-foreground">
              <Languages className="size-4 text-sidebar-foreground/70" aria-hidden />
              {t('common.language')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="min-w-44 rounded-md border-sidebar-border bg-sidebar p-1 text-sidebar-foreground">
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
                  className="rounded-sm text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground"
                >
                  {t('common.languages.en')}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="zh-CN"
                  className="rounded-sm text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground"
                >
                  {t('common.languages.zhCN')}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </div>

        <DropdownMenuSeparator className="mx-0 my-0 bg-sidebar-border" />

        <div className="px-2 py-2">
          <DropdownMenuItem
            className="h-9 rounded-md px-2 text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground"
            onSelect={() => {
              void onSignOut()
            }}
          >
            <LogOut className="size-4" />
            {t('authenticatedLayout.signOut')}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SidebarAccountMenu
