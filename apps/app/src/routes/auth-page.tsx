import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:py-12">
      <section className="flex-1 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/85 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-xs backdrop-blur">
          {t('authPage.hero.badge')}
        </div>
        <h1 className="text-balance font-display text-4xl text-foreground sm:text-5xl">
          {t('authPage.hero.title')}
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          {t('authPage.hero.description')}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{t('authPage.hero.tags.auth')}</Badge>
          <Badge variant="secondary">{t('authPage.hero.tags.router')}</Badge>
          <Badge variant="secondary">{t('authPage.hero.tags.styles')}</Badge>
        </div>
      </section>

      <section className="w-full max-w-lg">
        <Card className="motion-safe:animate-fade-up border-border/80 bg-card/90 shadow-soft-md backdrop-blur">
          <CardHeader className="gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">{t('authPage.panel.access')}</p>
                <h2 className="mt-1 font-display text-2xl">
                  {mode === 'login'
                    ? t('authPage.panel.welcomeBack')
                    : t('authPage.panel.createAccount')}
                </h2>
              </div>
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(value) => {
                  if (value === 'login' || value === 'signup') {
                    setMode(value)
                  }
                }}
              >
                <ToggleGroupItem value="login" aria-label={t('authPage.panel.modeLogin')} disabled={isLoading}>
                  {t('authPage.panel.modeLogin')}
                </ToggleGroupItem>
                <ToggleGroupItem value="signup" aria-label={t('authPage.panel.modeSignup')} disabled={isLoading}>
                  {t('authPage.panel.modeSignup')}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">{t('authPage.panel.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('authPage.panel.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>{t('authPage.panel.errorTitle')}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {notice && (
                <Alert>
                  <AlertTitle>{t('authPage.panel.noticeTitle')}</AlertTitle>
                  <AlertDescription>{notice}</AlertDescription>
                </Alert>
              )}

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading
                  ? t('authPage.panel.loading')
                  : mode === 'login'
                    ? t('authPage.panel.submitLogin')
                    : t('authPage.panel.submitSignup')}
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <p className="text-xs text-muted-foreground">
              {t('authPage.panel.policy')}
            </p>
          </CardFooter>
        </Card>
      </section>
    </div>
  )
}

export default AuthPage
