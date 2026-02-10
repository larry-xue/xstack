import { Paper, Stack, Text, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/app/projects')({
  component: ProjectsPage,
})

function ProjectsPage() {
  const { t } = useTranslation()

  return (
    <Paper withBorder radius="sm" p={20} bg="var(--app-surface)">
      <Stack gap={6}>
        <Title order={2} fw={600}>
          {t('projects.title')}
        </Title>
        <Text c="dimmed">{t('projects.description')}</Text>
      </Stack>
    </Paper>
  )
}
