import type { ReactNode } from 'react'
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { notionTheme } from '@/theme/notion-theme'

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'xstack-color-scheme',
})

type AppColorSchemeProviderProps = {
  children: ReactNode
}

export const AppColorSchemeProvider = ({ children }: AppColorSchemeProviderProps) => {
  return (
    <MantineProvider
      theme={notionTheme}
      defaultColorScheme="light"
      colorSchemeManager={colorSchemeManager}
    >
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  )
}
