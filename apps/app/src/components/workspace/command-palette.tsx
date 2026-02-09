import { useMemo } from 'react'
import { useMantineColorScheme } from '@mantine/core'
import { Spotlight } from '@mantine/spotlight'
import { useNavigate } from '@tanstack/react-router'
import { FolderKanban, Home, Inbox, Languages, ListTodo, MoonStar, Plus, Settings, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const TASK_FOCUS_EVENT = 'xstack:focus-new-task'

export const CommandPalette = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const currentLanguage: 'en' | 'zh-CN' = i18n.resolvedLanguage?.startsWith('zh') ? 'zh-CN' : 'en'

  const actions = useMemo(
    () => [
      {
        id: 'goto-home',
        label: t('shell.nav.home'),
        description: t('shell.command.gotoHome'),
        group: t('shell.command.groupNavigate'),
        leftSection: <Home size={15} />,
        onClick: () => void navigate({ to: '/app/home' }),
      },
      {
        id: 'goto-inbox',
        label: t('shell.nav.inbox'),
        description: t('shell.command.gotoInbox'),
        group: t('shell.command.groupNavigate'),
        leftSection: <Inbox size={15} />,
        onClick: () => void navigate({ to: '/app/inbox' }),
      },
      {
        id: 'goto-tasks',
        label: t('shell.nav.tasks'),
        description: t('shell.command.gotoTasks'),
        group: t('shell.command.groupNavigate'),
        leftSection: <ListTodo size={15} />,
        onClick: () => void navigate({ to: '/app/tasks' }),
      },
      {
        id: 'goto-projects',
        label: t('shell.nav.projects'),
        description: t('shell.command.gotoProjects'),
        group: t('shell.command.groupNavigate'),
        leftSection: <FolderKanban size={15} />,
        onClick: () => void navigate({ to: '/app/projects' }),
      },
      {
        id: 'goto-settings',
        label: t('shell.nav.settings'),
        description: t('shell.command.gotoSettings'),
        group: t('shell.command.groupNavigate'),
        leftSection: <Settings size={15} />,
        onClick: () => void navigate({ to: '/app/settings' }),
      },
      {
        id: 'create-task',
        label: t('shell.command.createTask'),
        description: t('shell.command.createTaskDesc'),
        group: t('shell.command.groupActions'),
        leftSection: <Plus size={15} />,
        onClick: () => {
          void navigate({ to: '/app/tasks' }).then(() => {
            window.dispatchEvent(new CustomEvent(TASK_FOCUS_EVENT))
          })
        },
      },
      {
        id: 'toggle-theme',
        label: colorScheme === 'dark' ? t('common.themeLight') : t('common.themeDark'),
        description: t('shell.command.toggleThemeDesc'),
        group: t('shell.command.groupActions'),
        leftSection: colorScheme === 'dark' ? <Sun size={15} /> : <MoonStar size={15} />,
        onClick: () => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark'),
      },
      {
        id: 'toggle-language',
        label: currentLanguage === 'zh-CN' ? t('common.languages.en') : t('common.languages.zhCN'),
        description: t('shell.command.toggleLanguageDesc'),
        group: t('shell.command.groupActions'),
        leftSection: <Languages size={15} />,
        onClick: () => void i18n.changeLanguage(currentLanguage === 'zh-CN' ? 'en' : 'zh-CN'),
      },
    ],
    [colorScheme, currentLanguage, i18n, navigate, setColorScheme, t],
  )

  return (
    <Spotlight
      actions={actions}
      nothingFound={t('shell.command.noResults')}
      shortcut={['mod + K']}
      searchProps={{
        placeholder: t('shell.command.placeholder'),
      }}
      maxHeight={420}
      scrollable
      closeOnActionTrigger
      transitionProps={{ duration: 150 }}
    />
  )
}
