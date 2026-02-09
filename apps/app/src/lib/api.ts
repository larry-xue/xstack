import { getAccessToken } from './auth'

export type Task = {
  id: string
  title: string
  isDone: boolean
  createdAt: string
  updatedAt: string
}

const request = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = await getAccessToken()
  const headers = new Headers(options.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(path, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? ''
    const text = await response.text()
    let message = text.length > 0 ? text : response.statusText

    if (contentType.includes('application/json')) {
      try {
        const payload = JSON.parse(text) as { error?: string }
        if (payload?.error) {
          message = payload.error
        }
      } catch {
        // Ignore JSON parsing errors and keep the raw message.
      }
    }

    throw new Error(message)
  }

  return (await response.json()) as T
}

export const getTasks = () => request<Task[]>('/api/todos')

export const createTask = (title: string) =>
  request<Task>('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })

export const updateTask = (id: string, data: { title?: string; isDone?: boolean }) =>
  request<Task>(`/api/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const deleteTask = (id: string) =>
  request<{ ok: true }>(`/api/todos/${id}`, {
    method: 'DELETE',
  })
