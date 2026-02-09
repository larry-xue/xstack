import {
  Button,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core'
import { useTranslation } from 'react-i18next'

const SettingsPage = () => {
  const { t, i18n } = useTranslation()
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const currentLanguage = i18n.resolvedLanguage?.startsWith('zh') ? 'zh-CN' : 'en'

  return (
    <Paper withBorder radius="sm" p={20} bg="var(--app-surface)">
      <Stack gap={20}>
        <Stack gap={6}>
          <Title order={2} fw={600}>
            {t('settings.title')}
          </Title>
          <Text c="dimmed">{t('settings.description')}</Text>
        </Stack>

        <Stack gap={10}>
          <Text fw={600}>{t('settings.appearance')}</Text>
          <Group>
            <Button
              variant={colorScheme === 'light' ? 'filled' : 'default'}
              onClick={() => setColorScheme('light')}
            >
              {t('common.themeLight')}
            </Button>
            <Button
              variant={colorScheme === 'dark' ? 'filled' : 'default'}
              onClick={() => setColorScheme('dark')}
            >
              {t('common.themeDark')}
            </Button>
          </Group>
        </Stack>

        <Stack gap={10}>
          <Text fw={600}>{t('settings.language')}</Text>
          <SegmentedControl
            value={currentLanguage}
            onChange={value => {
              if (value === 'en' || value === 'zh-CN') {
                void i18n.changeLanguage(value)
              }
            }}
            data={[
              { value: 'en', label: t('common.languages.en') },
              { value: 'zh-CN', label: t('common.languages.zhCN') },
            ]}
          />
        </Stack>
      </Stack>
    </Paper>
  )
}

export default SettingsPage
