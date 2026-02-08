import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTodo, deleteTodo, getTodos, updateTodo, type Todo } from '../lib/api'

const TodosPage = () => {
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
      setActionError(err instanceof Error ? err.message : 'Failed to create todo')
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
      setActionError(err instanceof Error ? err.message : 'Failed to update todo')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : 'Failed to delete todo')
    },
  })

  const isWorking =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const todos = useMemo(() => data ?? [], [data])

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
    <div className="space-y-8">
      <section className="card motion-safe:animate-fade-up">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">Protected demo</p>
            <h2 className="mt-1 font-display text-2xl text-slate-900">Todo CRUD</h2>
          </div>
          <span className="badge">API: /api/todos</span>
        </div>

        <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={submitNewTodo}>
          <input
            className="input flex-1"
            placeholder="Add a new task"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            minLength={1}
            maxLength={200}
            required
            disabled={isWorking}
          />
          <button className="btn-primary" type="submit" disabled={isWorking}>
            Add todo
          </button>
        </form>

        {actionError && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
            {actionError}
          </p>
        )}
      </section>

      <section className="card-muted">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-600">Your tasks</p>
          <p className="text-xs text-slate-500">{todos.length} items</p>
        </div>

        {isLoading && <p className="mt-4 text-sm text-slate-500">Loading todos...</p>}
        {isError && (
          <p className="mt-4 text-sm text-rose-600">
            {error instanceof Error ? error.message : 'Failed to load todos'}
          </p>
        )}

        {!isLoading && !isError && todos.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white/80 p-6 text-sm text-slate-500">
            No todos yet. Create your first task above.
          </div>
        )}

        <ul className="mt-4 space-y-3">
          {todos.map((todo) => {
            const isEditing = editingId === todo.id
            return (
              <li
                key={todo.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      className={`h-11 w-11 rounded-xl border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        todo.isDone
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                      type="button"
                      onClick={() => toggleDone(todo)}
                      aria-label={todo.isDone ? 'Mark as not done' : 'Mark as done'}
                      disabled={isWorking}
                    >
                      {todo.isDone ? 'Done' : 'Todo'}
                    </button>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          todo.isDone ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}
                      >
                        {todo.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        Created {new Date(todo.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="btn-ghost"
                      type="button"
                      onClick={() => startEditing(todo)}
                      disabled={isWorking}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-ghost"
                      type="button"
                      onClick={() => deleteMutation.mutate(todo.id)}
                      disabled={isWorking}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 sm:flex-row sm:items-center">
                    <input
                      className="input flex-1"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      maxLength={200}
                      disabled={isWorking}
                    />
                    <div className="flex gap-2">
                      <button
                        className="btn-primary"
                        type="button"
                        onClick={() => submitEdit(todo)}
                        disabled={isWorking}
                      >
                        Save
                      </button>
                      <button
                        className="btn-outline"
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={isWorking}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

export default TodosPage
