import { useEffect } from 'react'
import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../providers/auth'

const AuthenticatedLayout = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { session, isLoading, signOut } = useAuth()

  useEffect(() => {
    if (!isLoading && !session) {
      navigate({ to: '/auth' })
    }
  }, [isLoading, navigate, session])

  const handleSignOut = async () => {
    await signOut()
    await navigate({ to: '/auth' })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              XS
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {t('authenticatedLayout.brand')}
              </p>
              <p className="font-display text-lg text-slate-900">
                {t('authenticatedLayout.title')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-500">{t('authenticatedLayout.signedIn')}</p>
              <p className="text-sm font-semibold text-slate-800">
                {session?.user.email ?? t('common.loading')}
              </p>
            </div>
            <button className="btn-outline" type="button" onClick={handleSignOut}>
              {t('authenticatedLayout.signOut')}
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 pb-4">
          <Link
            to="/app/todos"
            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
          >
            {t('authenticatedLayout.todos')}
          </Link>
          <span className="text-xs text-slate-400">{t('authenticatedLayout.routeHint')}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {isLoading ? (
          <div className="card">{t('authenticatedLayout.loadingSession')}</div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}

export default AuthenticatedLayout
