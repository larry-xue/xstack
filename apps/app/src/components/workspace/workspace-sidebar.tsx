import type { CSSProperties } from 'react'
import { Avatar, Box, Group, Menu, Text, UnstyledButton } from '@mantine/core'
import {
  ChevronDown,
  Languages,
  LogOut,
  MoonStar,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export type WorkspaceNavItem = {
  key: string
  label: string
  icon: LucideIcon
  to?: string
  onClick?: () => void
}

type WorkspaceSidebarProps = {
  navItems: WorkspaceNavItem[]
  currentPath: string
  onNavigate: (to: string) => void
  onSignOut: () => Promise<void> | void
  email?: string
  isDarkMode: boolean
  currentLanguage: 'en' | 'zh-CN'
  onToggleTheme: () => void
  onToggleLanguage: () => void
}

const navItemStyle = (active: boolean): CSSProperties => ({
  width: '100%',
  borderRadius: 6,
  height: 34,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '0 10px',
  color: active ? 'var(--app-text)' : 'var(--app-muted)',
  backgroundColor: active ? 'var(--app-hover)' : 'transparent',
  transition: 'background-color 140ms ease, color 140ms ease',
  fontSize: 14,
  fontWeight: active ? 600 : 500,
})

const getUserInitials = (email?: string) => {
  const value = (email ?? 'U').trim()
  return value.slice(0, 2).toUpperCase()
}

export const WorkspaceSidebar = ({
  navItems,
  currentPath,
  onNavigate,
  onSignOut,
  email,
  isDarkMode,
  currentLanguage,
  onToggleTheme,
  onToggleLanguage,
}: WorkspaceSidebarProps) => {
  const { t } = useTranslation()
  const accountLabel = email ?? t('common.loading')

  return (
    <Box
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--app-surface)',
        borderRight: '1px solid var(--app-border)',
      }}
    >
      <Box px={12} py={12} style={{ borderBottom: '1px solid var(--app-border)' }}>
        <Text size="lg" fw={600} mt={2}>
          {t('common.productName')}
        </Text>
      </Box>

      <Box p={8} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.to
            ? currentPath === item.to || currentPath.startsWith(`${item.to}/`)
            : false

          return (
            <UnstyledButton
              key={item.key}
              style={navItemStyle(isActive)}
              onClick={() => {
                if (item.to) {
                  onNavigate(item.to)
                  return
                }
                item.onClick?.()
              }}
              aria-label={item.label}
            >
              <Icon size={16} />
              <Text size="sm">{item.label}</Text>
            </UnstyledButton>
          )
        })}
      </Box>

      <Box p={8} style={{ borderTop: '1px solid var(--app-border)' }}>
        <Menu shadow="sm" width={240} position="top-start">
        <Menu.Target>
          <UnstyledButton
            data-testid="sidebar-account-trigger"
            style={{
              width: '100%',
              height: 38,
                borderRadius: 8,
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid var(--app-border)',
                background: 'var(--app-bg)',
              }}
            >
              <Group gap={8} wrap="nowrap">
                <Avatar radius="xl" size={24} color="notion">
                  {getUserInitials(accountLabel)}
                </Avatar>
                <Text size="sm" truncate>
                  {accountLabel}
                </Text>
              </Group>
              <ChevronDown size={14} color="var(--app-muted)" />
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown data-testid="sidebar-account-menu">
            <Menu.Label>{t('shell.accountLabel')}</Menu.Label>
            <Menu.Item
              leftSection={isDarkMode ? <Sun size={14} /> : <MoonStar size={14} />}
              onClick={onToggleTheme}
            >
              {isDarkMode ? t('common.themeLight') : t('common.themeDark')}
            </Menu.Item>
            <Menu.Item leftSection={<Languages size={14} />} onClick={onToggleLanguage}>
              {currentLanguage === 'zh-CN'
                ? t('common.languages.en')
                : t('common.languages.zhCN')}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<LogOut size={14} />} onClick={() => void onSignOut()}>
              {t('shell.signOut')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Box>
    </Box>
  )
}
