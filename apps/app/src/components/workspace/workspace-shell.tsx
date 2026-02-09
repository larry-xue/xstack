import type { ReactNode } from 'react'
import { Box, Drawer, useMantineColorScheme } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { spotlight } from '@mantine/spotlight'
import { useTranslation } from 'react-i18next'
import { WorkspaceHeader } from './workspace-header'
import { WorkspaceSidebar, type WorkspaceNavItem } from './workspace-sidebar'

type WorkspaceShellProps = {
  title: string
  currentPath: string
  navItems: WorkspaceNavItem[]
  onNavigate: (to: string) => void
  onSignOut: () => Promise<void> | void
  email?: string
  children: ReactNode
}

const SIDEBAR_WIDTH = 252

export const WorkspaceShell = ({
  title,
  currentPath,
  navItems,
  onNavigate,
  onSignOut,
  email,
  children,
}: WorkspaceShellProps) => {
  const [drawerOpened, drawerHandlers] = useDisclosure(false)
  const isDesktop = useMediaQuery('(min-width: 62em)')
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const { i18n, t } = useTranslation()
  const currentLanguage: 'en' | 'zh-CN' = i18n.resolvedLanguage?.startsWith('zh') ? 'zh-CN' : 'en'

  const handleNavigate = (to: string) => {
    onNavigate(to)
    drawerHandlers.close()
  }

  return (
    <Box style={{ minHeight: '100vh', background: 'var(--app-bg)' }} data-testid="workspace-shell-root">
      {isDesktop ? (
        <Box
          data-testid="workspace-shell-sidebar"
          style={{
            position: 'fixed',
            inset: '0 auto 0 0',
            width: SIDEBAR_WIDTH,
            zIndex: 30,
          }}
        >
          <WorkspaceSidebar
            navItems={navItems}
            currentPath={currentPath}
            onNavigate={handleNavigate}
            onSignOut={onSignOut}
            email={email}
            isDarkMode={colorScheme === 'dark'}
            currentLanguage={currentLanguage}
            onToggleTheme={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
            onToggleLanguage={() => {
              void i18n.changeLanguage(currentLanguage === 'zh-CN' ? 'en' : 'zh-CN')
            }}
          />
        </Box>
      ) : (
        <Drawer
          opened={drawerOpened}
          onClose={drawerHandlers.close}
          title={t('shell.workspaceLabel')}
          size={SIDEBAR_WIDTH}
          padding={0}
          styles={{
            body: { padding: 0, height: '100%' },
            content: { background: 'var(--app-surface)' },
            header: { borderBottom: '1px solid var(--app-border)' },
          }}
        >
          <Box style={{ height: 'calc(100vh - 56px)' }}>
            <WorkspaceSidebar
              navItems={navItems}
              currentPath={currentPath}
              onNavigate={handleNavigate}
              onSignOut={onSignOut}
              email={email}
              isDarkMode={colorScheme === 'dark'}
              currentLanguage={currentLanguage}
              onToggleTheme={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
              onToggleLanguage={() => {
                void i18n.changeLanguage(currentLanguage === 'zh-CN' ? 'en' : 'zh-CN')
              }}
            />
          </Box>
        </Drawer>
      )}

      <Box style={{ minHeight: '100vh', marginLeft: isDesktop ? SIDEBAR_WIDTH : 0 }}>
        <WorkspaceHeader
          title={title}
          isMobile={!isDesktop}
          onOpenNavigation={drawerHandlers.open}
          onOpenCommandPalette={() => spotlight.open()}
        />
        <Box
          component="main"
          data-testid="workspace-shell-main"
          px={{ base: 14, sm: 20, lg: 28 }}
          py={{ base: 16, sm: 20, lg: 24 }}
          style={{
            margin: '0 auto',
            width: '100%',
            maxWidth: 1240,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
