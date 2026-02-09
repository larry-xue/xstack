import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Circle, PencilLine, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
    <section className="w-full space-y-5" data-testid="todos-page">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-4xl leading-none tracking-tight" data-testid="todos-title">
            {t('todosPage.section.title')}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t('todosPage.list.itemsCount', { count: todos.length })}
          </p>
        </div>

        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={submitNewTodo}>
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
      </div>

      <div className="space-y-4">
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

        <ul className="divide-y divide-border/60">
          {todos.map((todo) => {
            const isEditing = editingId === todo.id
            return (
              <li key={todo.id} className="py-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Button
                      variant={todo.isDone ? 'secondary' : 'ghost'}
                      size="icon-sm"
                      className={todo.isDone ? 'text-emerald-600 dark:text-emerald-300' : 'text-muted-foreground'}
                      type="button"
                      onClick={() => toggleDone(todo)}
                      aria-label={
                        todo.isDone
                          ? t('todosPage.list.markUndone')
                          : t('todosPage.list.markDone')
                      }
                      disabled={isWorking}
                    >
                      {todo.isDone ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                    </Button>
                    <div className="min-w-0">
                      <p
                        className={`truncate text-[15px] font-medium ${
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
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      type="button"
                      aria-label={t('todosPage.list.edit')}
                      onClick={() => startEditing(todo)}
                      disabled={isWorking}
                    >
                      <PencilLine className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      type="button"
                      aria-label={t('todosPage.list.delete')}
                      onClick={() => deleteMutation.mutate(todo.id)}
                      disabled={isWorking}
                    >
                      <Trash2 className="size-4" />
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
      </div>
    </section>
  )
}

export default TodosPage
