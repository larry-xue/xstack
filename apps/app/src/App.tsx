import { Outlet, useRouterState } from '@tanstack/react-router'
import LanguageSwitcher from './components/language-switcher'
import ThemeToggle from './components/theme-toggle'

export default function App() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isAppRoute = pathname.startsWith('/app')

  return (
    <div className="min-h-screen">
      {!isAppRoute && (
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 pt-4 sm:px-6">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      )}
      <Outlet />
    </div>
  )
}
