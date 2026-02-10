import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/spotlight/styles.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './index.css'
import { AuthProvider } from './providers/auth'
import { AppColorSchemeProvider } from './providers/color-scheme'
import { queryClient } from './lib/query-client'
import { router } from './router'
import './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppColorSchemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </AppColorSchemeProvider>
  </StrictMode>,
)
