import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
    <div className="space-y-6">
      <Card className="motion-safe:animate-fade-up border-border/80 bg-card/85 shadow-soft-md backdrop-blur">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{t('todosPage.section.badge')}</p>
              <CardTitle className="mt-1 font-display text-2xl">{t('todosPage.section.title')}</CardTitle>
            </div>
            <Badge variant="outline">{t('todosPage.section.apiBadge')}</Badge>
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

        {actionError && (
          <CardContent className="pt-0">
            <Alert variant="destructive">
              <AlertTitle>{t('todosPage.errors.actionFailed')}</AlertTitle>
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      <Card className="border-border/75 bg-card/75">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-muted-foreground">{t('todosPage.list.title')}</p>
            <p className="text-xs text-muted-foreground">
              {t('todosPage.list.itemsCount', { count: todos.length })}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t('todosPage.list.loading')}</p>
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
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
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/25 p-6 text-sm text-muted-foreground">
              {t('todosPage.list.empty')}
            </div>
          )}

          <ul className="space-y-3">
          {todos.map((todo) => {
            const isEditing = editingId === todo.id
            return (
              <li
                key={todo.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant={todo.isDone ? 'secondary' : 'outline'}
                      className={`h-11 min-w-11 text-sm font-semibold ${
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
                  <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 px-3 py-3 sm:flex-row sm:items-center">
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
    </div>
  )
}

export default TodosPage
