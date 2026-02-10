import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronLeft, ChevronRight, PencilLine, Plus, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TASK_FOCUS_EVENT } from '@/components/workspace/command-palette'
import { createTask, deleteTask, getTasks, updateTask, type Task } from '@/lib/api'

type TaskSortBy = 'createdAt' | 'updatedAt' | 'title'
type TaskSortOrder = 'asc' | 'desc'
type TaskStatus = 'all' | 'todo' | 'done'

export const Route = createFileRoute('/app/tasks')({
  component: TasksPage,
})

const statusBadgeColor = (done: boolean) => (done ? 'teal' : 'gray')

function TasksPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const newTaskInputRef = useRef<HTMLInputElement>(null)
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [status, setStatus] = useState<TaskStatus>('all')
  const [sortBy, setSortBy] = useState<TaskSortBy>('createdAt')
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('desc')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const query = useMemo(
    () => ({
      page,
      pageSize,
      sortBy,
      sortOrder,
      status,
    }),
    [page, pageSize, sortBy, sortOrder, status],
  )

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', query],
    queryFn: () => getTasks(query),
    meta: {
      fallbackI18nKey: 'tasks.errors.loadFailed',
    },
  })

  const createMutation = useMutation({
    mutationFn: createTask,
    meta: {
      fallbackI18nKey: 'tasks.errors.createFailed',
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setNewTitle('')
      setPage(1)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data: patch }: { id: string; data: { title?: string; isDone?: boolean } }) =>
      updateTask(id, patch),
    meta: {
      fallbackI18nKey: 'tasks.errors.updateFailed',
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setEditingId(null)
      setEditingTitle('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    meta: {
      fallbackI18nKey: 'tasks.errors.deleteFailed',
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const tasks = useMemo(() => data?.items ?? [], [data?.items])
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
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

  useEffect(() => {
    if (!data) {
      return
    }

    if (page > data.totalPages) {
      setPage(data.totalPages)
    }
  }, [data, page])

  const submitNewTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = newTitle.trim()
    if (!trimmed) {
      return
    }

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

    updateMutation.mutate({ id: task.id, data: { title: trimmed } })
  }

  const toggleDone = (task: Task) => {
    updateMutation.mutate({ id: task.id, data: { isDone: !task.isDone } })
  }

  return (
    <Stack gap={16} data-testid="tasks-page">
      <Paper withBorder radius="sm" p={12} bg="var(--app-surface)">
        <form onSubmit={submitNewTask}>
          <Group align="end" wrap="nowrap">
            <TextInput
              ref={newTaskInputRef}
              label={t('tasks.form.label')}
              placeholder={t('tasks.form.placeholder')}
              value={newTitle}
              onChange={event => setNewTitle(event.currentTarget.value)}
              disabled={isWorking}
              required
              style={{ flex: 1 }}
            />
            <Button
              type="submit"
              leftSection={<Plus size={14} />}
              loading={createMutation.isPending}
            >
              {t('tasks.form.submit')}
            </Button>
          </Group>
        </form>
      </Paper>

      <Paper withBorder radius="sm" p={12} bg="var(--app-surface)">
        <Group grow align="end">
          <Select
            label="Status"
            data={[
              { value: 'all', label: 'All' },
              { value: 'todo', label: t('tasks.status.todo') },
              { value: 'done', label: t('tasks.status.done') },
            ]}
            value={status}
            onChange={next => {
              if (!next) {
                return
              }
              setStatus(next as TaskStatus)
              setPage(1)
            }}
            disabled={isLoading}
          />
          <Select
            label="Sort by"
            data={[
              { value: 'createdAt', label: 'Created time' },
              { value: 'updatedAt', label: 'Updated time' },
              { value: 'title', label: 'Title' },
            ]}
            value={sortBy}
            onChange={next => {
              if (!next) {
                return
              }
              setSortBy(next as TaskSortBy)
              setPage(1)
            }}
            disabled={isLoading}
          />
          <Select
            label="Order"
            data={[
              { value: 'desc', label: 'Descending' },
              { value: 'asc', label: 'Ascending' },
            ]}
            value={sortOrder}
            onChange={next => {
              if (!next) {
                return
              }
              setSortOrder(next as TaskSortOrder)
              setPage(1)
            }}
            disabled={isLoading}
          />
          <Select
            label="Page size"
            data={[
              { value: '10', label: '10' },
              { value: '20', label: '20' },
              { value: '50', label: '50' },
            ]}
            value={String(pageSize)}
            onChange={next => {
              if (!next) {
                return
              }
              setPageSize(Number(next))
              setPage(1)
            }}
            disabled={isLoading}
          />
        </Group>
      </Paper>

      {isLoading && (
        <Group gap={8}>
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            {t('tasks.loading')}
          </Text>
        </Group>
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
                <Table.Th>Updated At</Table.Th>
                <Table.Th style={{ width: 132 }}>{t('tasks.table.actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tasks.map(task => {
                const isEditing = editingId === task.id
                return (
                  <Table.Tr key={task.id}>
                    <Table.Td>
                      {isEditing ? (
                        <TextInput
                          value={editingTitle}
                          onChange={event => setEditingTitle(event.currentTarget.value)}
                          onKeyDown={event => {
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
                      <Text size="sm" c="dimmed">
                        {formatter.format(new Date(task.updatedAt))}
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
                              aria-label={
                                task.isDone
                                  ? t('tasks.actions.markUndone')
                                  : t('tasks.actions.markDone')
                              }
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

      {!isLoading && !isError && (
        <Group justify="space-between" align="center">
          <Group gap={8}>
            <Badge variant="light">Total: {total}</Badge>
            <Badge variant="outline">
              Page {page} / {totalPages}
            </Badge>
          </Group>
          <Group gap={8}>
            <Button
              variant="default"
              leftSection={<ChevronLeft size={14} />}
              onClick={() => setPage(current => Math.max(1, current - 1))}
              disabled={isLoading || page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="default"
              rightSection={<ChevronRight size={14} />}
              onClick={() => setPage(current => Math.min(totalPages, current + 1))}
              disabled={isLoading || page >= totalPages}
            >
              Next
            </Button>
          </Group>
        </Group>
      )}
    </Stack>
  )
}
