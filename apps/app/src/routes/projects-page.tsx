import { Paper, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'

const ProjectsPage = () => {
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

export default ProjectsPage
