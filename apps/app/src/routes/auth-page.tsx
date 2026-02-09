import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <Card className="w-full border-border/80 bg-card/90 shadow-soft-md">
        <CardHeader className="gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl">
                {mode === 'login'
                  ? t('authPage.panel.welcomeBack')
                  : t('authPage.panel.createAccount')}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('authPage.hero.description')}
              </p>
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
    </div>
  )
}

export default AuthPage
