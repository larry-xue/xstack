import { ActionIcon, Box, Group, Text, UnstyledButton } from '@mantine/core'
import { Menu, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type WorkspaceHeaderProps = {
  title: string
  onOpenNavigation: () => void
  onOpenCommandPalette: () => void
  isMobile: boolean
}

export const WorkspaceHeader = ({
  title,
  onOpenNavigation,
  onOpenCommandPalette,
  isMobile,
}: WorkspaceHeaderProps) => {
  const { t } = useTranslation()

  return (
    <Box
      component="header"
      data-testid="workspace-shell-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        height: 56,
        borderBottom: '1px solid var(--app-border)',
        background: 'var(--app-bg)',
      }}
    >
      <Group justify="space-between" h="100%" px={16} wrap="nowrap">
        <Group gap={10} wrap="nowrap">
          {isMobile && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size={30}
              onClick={onOpenNavigation}
              aria-label={t('shell.openNavigation')}
            >
              <Menu size={16} />
            </ActionIcon>
          )}
          <Text fw={600} size="xl" style={{ lineHeight: 1.1 }}>
            {title}
          </Text>
        </Group>

        <UnstyledButton
          onClick={onOpenCommandPalette}
          aria-label={t('shell.openCommandPalette')}
          style={{
            border: '1px solid var(--app-border)',
            background: 'var(--app-surface)',
            borderRadius: 8,
            height: 32,
            minWidth: isMobile ? 140 : 224,
            maxWidth: isMobile ? 180 : 280,
            padding: '0 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            color: 'var(--app-muted)',
          }}
        >
          <Group gap={6} wrap="nowrap">
            <Search size={14} />
            <Text size="sm" c="dimmed" lineClamp={1}>
              {t('shell.searchPlaceholder')}
            </Text>
          </Group>
          {!isMobile && (
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              style={{ padding: '2px 6px', borderRadius: 6, border: '1px solid var(--app-border)' }}
            >
              Ctrl+K
            </Text>
          )}
        </UnstyledButton>
      </Group>
    </Box>
  )
}
