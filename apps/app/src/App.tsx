import { Outlet } from '@tanstack/react-router'
import LanguageSwitcher from './components/language-switcher'

export default function App() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-6xl justify-end px-6 pt-4">
        <LanguageSwitcher />
      </div>
      <Outlet />
    </div>
  )
}
