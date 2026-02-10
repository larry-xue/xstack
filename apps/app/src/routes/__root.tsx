import { Alert, Button, Center, Paper, Stack, Text, Title } from '@mantine/core'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <Center mih="100vh" px="md">
      <Paper withBorder radius="sm" p={26} w="100%" maw={500} bg="var(--app-surface)">
        <Stack gap={8}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            {t('router.notFound.code')}
          </Text>
          <Title order={2} fw={600}>
            {t('router.notFound.title')}
          </Title>
          <Text c="dimmed">{t('router.notFound.description')}</Text>
          <Alert color="gray" variant="light">
            {t('router.notFound.hint')}
          </Alert>
          <Button component="a" href="/app/home" variant="light" w="fit-content">
            {t('router.notFound.backHome')}
          </Button>
        </Stack>
      </Paper>
    </Center>
  )
}

const RootComponent = () => <Outlet />

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})
