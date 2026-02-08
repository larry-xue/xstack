import { useEffect } from 'react'
import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../providers/auth'

const AuthenticatedLayout = () => {
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
                XStack Starter
              </p>
              <p className="font-display text-lg text-slate-900">Authenticated workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-500">Signed in</p>
              <p className="text-sm font-semibold text-slate-800">
                {session?.user.email ?? 'Loading...'}
              </p>
            </div>
            <button className="btn-outline" type="button" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 pb-4">
          <Link
            to="/app/todos"
            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
          >
            Todos
          </Link>
          <span className="text-xs text-slate-400">Protected route example</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {isLoading ? (
          <div className="card">Loading session...</div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}

export default AuthenticatedLayout
