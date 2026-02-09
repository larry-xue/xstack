import { useState, type FormEvent } from 'react'
import {
  Alert,
  Anchor,
  Button,
  Center,
  Paper,
  PasswordInput,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useNavigate } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'

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
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      await navigate({ to: '/app/home' })
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    if (data.session) {
      await navigate({ to: '/app/home' })
      return
    }

    setNotice(t('auth.signupNotice'))
    setIsLoading(false)
  }

  return (
    <Center mih="100vh" px="md" py={36}>
      <Paper
        shadow="sm"
        radius="md"
        withBorder
        p={{ base: 20, sm: 26 }}
        w="100%"
        maw={460}
        bg="var(--app-surface)"
      >
        <Stack gap={18}>
          <Stack gap={4}>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              {t('common.productName')}
            </Text>
            <Title order={2} fw={600}>
              {mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}
            </Title>
            <Text size="sm" c="dimmed">
              {t('auth.description')}
            </Text>
          </Stack>

          <SegmentedControl
            value={mode}
            onChange={(value) => {
              if (value === 'login' || value === 'signup') {
                setMode(value)
              }
            }}
            fullWidth
            data={[
              { label: t('auth.modeLogin'), value: 'login' },
              { label: t('auth.modeSignup'), value: 'signup' },
            ]}
          />

          <form onSubmit={handleSubmit}>
            <Stack gap={12}>
              <TextInput
                label={t('auth.email')}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                required
                disabled={isLoading}
              />
              <PasswordInput
                label={t('auth.password')}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                required
                disabled={isLoading}
              />

              {error && (
                <Alert color="red" title={t('auth.errorTitle')} icon={<AlertCircle size={16} />}>
                  {error}
                </Alert>
              )}
              {notice && (
                <Alert color="blue" title={t('auth.noticeTitle')} icon={<AlertCircle size={16} />}>
                  {notice}
                </Alert>
              )}

              <Button type="submit" loading={isLoading}>
                {mode === 'login' ? t('auth.submitLogin') : t('auth.submitSignup')}
              </Button>
            </Stack>
          </form>

          <Text size="xs" c="dimmed">
            {t('auth.policyPrefix')}{' '}
            <Anchor size="xs" underline="always">
              {t('auth.policyLink')}
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Center>
  )
}

export default AuthPage
