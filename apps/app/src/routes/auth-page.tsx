import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

const AuthPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setIsLoading(true)

    if (mode === 'login') {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      await navigate({ to: '/app/todos' })
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    if (data.session) {
      await navigate({ to: '/app/todos' })
      return
    }

    setNotice(t('authPage.panel.signupNotice'))
    setIsLoading(false)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-12 lg:flex-row lg:items-center">
      <section className="flex-1 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
          {t('authPage.hero.badge')}
        </div>
        <h1 className="text-balance font-display text-4xl text-slate-900 sm:text-5xl">
          {t('authPage.hero.title')}
        </h1>
        <p className="max-w-xl text-base text-slate-600">
          {t('authPage.hero.description')}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge">{t('authPage.hero.tags.auth')}</span>
          <span className="badge">{t('authPage.hero.tags.router')}</span>
          <span className="badge">{t('authPage.hero.tags.styles')}</span>
        </div>
      </section>

      <section className="w-full max-w-lg">
        <div className="card motion-safe:animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">{t('authPage.panel.access')}</p>
              <h2 className="mt-1 font-display text-2xl text-slate-900">
                {mode === 'login'
                  ? t('authPage.panel.welcomeBack')
                  : t('authPage.panel.createAccount')}
              </h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                className={`px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  mode === 'login'
                    ? 'rounded-full bg-slate-900 text-white'
                    : 'text-slate-600'
                }`}
                type="button"
                onClick={() => setMode('login')}
                disabled={isLoading}
              >
                {t('authPage.panel.modeLogin')}
              </button>
              <button
                className={`px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  mode === 'signup'
                    ? 'rounded-full bg-slate-900 text-white'
                    : 'text-slate-600'
                }`}
                type="button"
                onClick={() => setMode('signup')}
                disabled={isLoading}
              >
                {t('authPage.panel.modeSignup')}
              </button>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
              {t('authPage.panel.email')}
            </label>
            <input
              className="input"
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isLoading}
            />

            <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
              {t('authPage.panel.password')}
            </label>
            <input
              className="input"
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isLoading}
            />

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700" role="status">
                {notice}
              </p>
            )}

            <button className="btn-primary w-full" type="submit" disabled={isLoading}>
              {isLoading
                ? t('authPage.panel.loading')
                : mode === 'login'
                  ? t('authPage.panel.submitLogin')
                  : t('authPage.panel.submitSignup')}
            </button>
          </form>

          <p className="mt-5 text-xs text-slate-500">
            {t('authPage.panel.policy')}
          </p>
        </div>
      </section>
    </div>
  )
}

export default AuthPage
