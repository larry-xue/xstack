import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { createTodo, deleteTodo, getTodos, updateTodo, type Todo } from '../lib/api'

const TodosPage = () => {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  })

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      setNewTitle('')
    },
    onError: (err) => {
      setActionError(
        err instanceof Error ? err.message : t('todosPage.errors.createFailed'),
      )
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data: patch }: { id: string; data: { title?: string; isDone?: boolean } }) =>
      updateTodo(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      setEditingId(null)
      setEditingTitle('')
    },
    onError: (err) => {
      setActionError(
        err instanceof Error ? err.message : t('todosPage.errors.updateFailed'),
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError: (err) => {
      setActionError(
        err instanceof Error ? err.message : t('todosPage.errors.deleteFailed'),
      )
    },
  })

  const isWorking =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const todos = useMemo(() => data ?? [], [data])
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [i18n.language],
  )

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id)
    setEditingTitle(todo.title)
  }

  const submitNewTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = newTitle.trim()
    if (!trimmed) {
      return
    }
    setActionError(null)
    createMutation.mutate(trimmed)
  }

  const submitEdit = (todo: Todo) => {
    const trimmed = editingTitle.trim()
    if (!trimmed || trimmed === todo.title) {
      setEditingId(null)
      return
    }
    setActionError(null)
    updateMutation.mutate({ id: todo.id, data: { title: trimmed } })
  }

  const toggleDone = (todo: Todo) => {
    setActionError(null)
    updateMutation.mutate({ id: todo.id, data: { isDone: !todo.isDone } })
  }

  return (
    <Card className="border-border/80 bg-card/90">
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="font-display text-2xl">{t('todosPage.section.title')}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {t('todosPage.list.itemsCount', { count: todos.length })}
          </p>
        </div>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submitNewTodo}>
          <Input
            className="sm:flex-1"
            placeholder={t('todosPage.form.placeholder')}
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            minLength={1}
            maxLength={200}
            required
            disabled={isWorking}
          />
          <Button type="submit" disabled={isWorking}>
            {t('todosPage.form.submit')}
          </Button>
        </form>
      </CardHeader>

      <CardContent className="space-y-4">
        {actionError && (
          <Alert variant="destructive">
            <AlertTitle>{t('todosPage.errors.actionFailed')}</AlertTitle>
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t('todosPage.list.loading')}</p>
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        )}
        {isError && (
          <Alert variant="destructive">
            <AlertTitle>{t('todosPage.errors.loadFailed')}</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : t('todosPage.errors.loadFailed')}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !isError && todos.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('todosPage.list.empty')}</p>
        )}

        <ul>
          {todos.map((todo) => {
            const isEditing = editingId === todo.id
            return (
              <li key={todo.id} className="border-b border-border/60 py-3 last:border-b-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant={todo.isDone ? 'secondary' : 'outline'}
                      className={`h-10 min-w-10 text-xs font-semibold ${
                        todo.isDone
                          ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : ''
                      }`}
                      type="button"
                      onClick={() => toggleDone(todo)}
                      aria-label={
                        todo.isDone
                          ? t('todosPage.list.markUndone')
                          : t('todosPage.list.markDone')
                      }
                      disabled={isWorking}
                    >
                      {todo.isDone ? t('todosPage.list.done') : t('todosPage.list.todo')}
                    </Button>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          todo.isDone ? 'text-muted-foreground line-through' : 'text-foreground'
                        }`}
                      >
                        {todo.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('todosPage.list.createdAt', {
                          value: dateFormatter.format(new Date(todo.createdAt)),
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => startEditing(todo)}
                      disabled={isWorking}
                    >
                      {t('todosPage.list.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => deleteMutation.mutate(todo.id)}
                      disabled={isWorking}
                    >
                      {t('todosPage.list.delete')}
                    </Button>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      className="flex-1"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      maxLength={200}
                      disabled={isWorking}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => submitEdit(todo)}
                        disabled={isWorking}
                      >
                        {t('todosPage.list.save')}
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={isWorking}
                      >
                        {t('todosPage.list.cancel')}
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export default TodosPage
