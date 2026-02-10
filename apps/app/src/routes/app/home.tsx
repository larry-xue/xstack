import { Paper, Stack, Text, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/app/home')({
  component: HomePage,
})

function HomePage() {
  const { t } = useTranslation()

  return (
    <Paper withBorder radius="sm" p={20} bg="var(--app-surface)">
      <Stack gap={6}>
        <Title order={2} fw={600}>
          {t('home.title')}
        </Title>
        <Text c="dimmed">{t('home.description')}</Text>
      </Stack>
    </Paper>
  )
}
