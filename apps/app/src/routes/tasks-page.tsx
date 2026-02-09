import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, PencilLine, Plus, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TASK_FOCUS_EVENT } from '@/components/workspace/command-palette'
import { createTask, deleteTask, getTasks, updateTask, type Task } from '@/lib/api'

const statusBadgeColor = (done: boolean) => (done ? 'teal' : 'gray')

const TasksPage = () => {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const newTaskInputRef = useRef<HTMLInputElement>(null)
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  })

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setNewTitle('')
    },
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : t('tasks.errors.createFailed'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data: patch }: { id: string; data: { title?: string; isDone?: boolean } }) =>
      updateTask(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setEditingId(null)
      setEditingTitle('')
    },
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : t('tasks.errors.updateFailed'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : t('tasks.errors.deleteFailed'))
    },
  })

  const tasks = useMemo(() => data ?? [], [data])
  const isWorking = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  const formatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }),
    [i18n.language],
  )

  useEffect(() => {
    const handler = () => {
      newTaskInputRef.current?.focus()
    }

    window.addEventListener(TASK_FOCUS_EVENT, handler as EventListener)
    return () => {
      window.removeEventListener(TASK_FOCUS_EVENT, handler as EventListener)
    }
  }, [])

  const submitNewTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = newTitle.trim()
    if (!trimmed) {
      return
    }
    setActionError(null)
    createMutation.mutate(trimmed)
  }

  const startEditing = (task: Task) => {
    setEditingId(task.id)
    setEditingTitle(task.title)
  }

  const submitEdit = (task: Task) => {
    const trimmed = editingTitle.trim()
    if (!trimmed) {
      setEditingId(null)
      return
    }
    if (trimmed === task.title) {
      setEditingId(null)
      return
    }
    setActionError(null)
    updateMutation.mutate({ id: task.id, data: { title: trimmed } })
  }

  const toggleDone = (task: Task) => {
    setActionError(null)
    updateMutation.mutate({ id: task.id, data: { isDone: !task.isDone } })
  }

  return (
    <Stack gap={16} data-testid="tasks-page">
      <Group justify="space-between" align="end">
        <Stack gap={2}>
          <Text size="xl" fw={600} data-testid="tasks-title">
            {t('tasks.title')}
          </Text>
          <Text size="sm" c="dimmed">
            {t('tasks.subtitle')}
          </Text>
        </Stack>
        <Text size="sm" c="dimmed">
          {t('tasks.count', { count: tasks.length })}
        </Text>
      </Group>

      <Paper withBorder radius="sm" p={12} bg="var(--app-surface)">
        <form onSubmit={submitNewTask}>
          <Group align="end" wrap="nowrap">
            <TextInput
              ref={newTaskInputRef}
              label={t('tasks.form.label')}
              placeholder={t('tasks.form.placeholder')}
              value={newTitle}
              onChange={(event) => setNewTitle(event.currentTarget.value)}
              disabled={isWorking}
              required
              style={{ flex: 1 }}
            />
            <Button type="submit" leftSection={<Plus size={14} />} loading={createMutation.isPending}>
              {t('tasks.form.submit')}
            </Button>
          </Group>
        </form>
      </Paper>

      {actionError && (
        <Alert color="red" title={t('tasks.errors.actionFailed')}>
          {actionError}
        </Alert>
      )}

      {isLoading && (
        <Group gap={8}>
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            {t('tasks.loading')}
          </Text>
        </Group>
      )}

      {isError && (
        <Alert color="red" title={t('tasks.errors.loadFailed')}>
          {error instanceof Error ? error.message : t('tasks.errors.loadFailed')}
        </Alert>
      )}

      {!isLoading && !isError && tasks.length === 0 && (
        <Text size="sm" c="dimmed">
          {t('tasks.empty')}
        </Text>
      )}

      {!isLoading && !isError && tasks.length > 0 && (
        <Paper withBorder radius="sm" bg="var(--app-bg)">
          <Table
            striped
            highlightOnHover
            horizontalSpacing="md"
            verticalSpacing="sm"
            withTableBorder={false}
            data-testid="tasks-table"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('tasks.table.title')}</Table.Th>
                <Table.Th>{t('tasks.table.status')}</Table.Th>
                <Table.Th>{t('tasks.table.createdAt')}</Table.Th>
                <Table.Th style={{ width: 132 }}>{t('tasks.table.actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tasks.map((task) => {
                const isEditing = editingId === task.id
                return (
                  <Table.Tr key={task.id}>
                    <Table.Td>
                      {isEditing ? (
                        <TextInput
                          value={editingTitle}
                          onChange={(event) => setEditingTitle(event.currentTarget.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              submitEdit(task)
                            }
                            if (event.key === 'Escape') {
                              setEditingId(null)
                            }
                          }}
                          disabled={isWorking}
                        />
                      ) : (
                        <Text
                          fw={500}
                          style={{
                            textDecoration: task.isDone ? 'line-through' : 'none',
                            color: task.isDone ? 'var(--app-muted)' : 'var(--app-text)',
                          }}
                        >
                          {task.title}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={statusBadgeColor(task.isDone)} variant="light">
                        {task.isDone ? t('tasks.status.done') : t('tasks.status.todo')}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {formatter.format(new Date(task.createdAt))}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6} wrap="nowrap">
                        {isEditing ? (
                          <>
                            <ActionIcon
                              variant="light"
                              color="teal"
                              aria-label={t('tasks.actions.save')}
                              onClick={() => submitEdit(task)}
                              disabled={isWorking}
                            >
                              <Check size={14} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="gray"
                              aria-label={t('tasks.actions.cancel')}
                              onClick={() => setEditingId(null)}
                              disabled={isWorking}
                            >
                              <X size={14} />
                            </ActionIcon>
                          </>
                        ) : (
                          <>
                            <ActionIcon
                              variant="light"
                              color={task.isDone ? 'gray' : 'teal'}
                              aria-label={task.isDone ? t('tasks.actions.markUndone') : t('tasks.actions.markDone')}
                              onClick={() => toggleDone(task)}
                              disabled={isWorking}
                            >
                              <Check size={14} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="gray"
                              aria-label={t('tasks.actions.edit')}
                              onClick={() => startEditing(task)}
                              disabled={isWorking}
                            >
                              <PencilLine size={14} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="red"
                              aria-label={t('tasks.actions.delete')}
                              onClick={() => deleteMutation.mutate(task.id)}
                              disabled={isWorking}
                            >
                              <Trash2 size={14} />
                            </ActionIcon>
                          </>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Stack>
  )
}

export default TasksPage
