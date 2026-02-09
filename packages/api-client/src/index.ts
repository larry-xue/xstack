import type { operations, paths } from './generated/schema'

export type OpenApiPaths = paths

type ListTodosResponse =
  operations['getApiV1Todos']['responses'][200]['content']['application/json']
type CreateTodoResponse =
  operations['postApiV1Todos']['responses'][200]['content']['application/json']
type UpdateTodoResponse =
  operations['patchApiV1TodosById']['responses'][200]['content']['application/json']
type DeleteTodoResponse =
  operations['deleteApiV1TodosById']['responses'][200]['content']['application/json']

type CreateTodoBody = operations['postApiV1Todos']['requestBody']['content']['application/json']
export type UpdateTodoPatch =
  operations['patchApiV1TodosById']['requestBody']['content']['application/json']
type ErrorEnvelope = operations['getApiV1Todos']['responses'][401]['content']['application/json']

export type Task = ListTodosResponse['data'][number]

type RequestOptions = {
  baseUrl?: string
  getAccessToken?: () => Promise<string | null>
  fetcher?: typeof fetch
}

const toErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== 'object') {
    return fallback
  }

  const envelope = payload as Partial<ErrorEnvelope>

  const message = envelope.error?.message
  if (typeof message === 'string' && message.length > 0) {
    return message
  }

  return fallback
}

const createRequest = (options: RequestOptions) => {
  const baseUrl = options.baseUrl ?? ''
  const fetcher = options.fetcher ?? fetch

  return async <TResponse>(path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers)
    const accessToken = options.getAccessToken ? await options.getAccessToken() : null

    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`)
    }

    if (init.body && !headers.has('content-type')) {
      headers.set('content-type', 'application/json')
    }

    const response = await fetcher(`${baseUrl}${path}`, {
      ...init,
      headers,
    })
    const text = await response.text()
    const hasJson = (response.headers.get('content-type') ?? '').includes('application/json')
    const parsed = hasJson && text.length > 0 ? JSON.parse(text) : null

    if (!response.ok) {
      throw new Error(toErrorMessage(parsed, response.statusText))
    }

    if (!parsed) {
      throw new Error('Expected JSON response body')
    }

    return parsed as TResponse
  }
}

export const createApiClient = (options: RequestOptions = {}) => {
  const request = createRequest(options)

  return {
    getTodos: async () => {
      const response = await request<ListTodosResponse>('/api/v1/todos')
      return response.data
    },
    createTodo: async (title: string) => {
      const payload: CreateTodoBody = { title }
      const response = await request<CreateTodoResponse>('/api/v1/todos', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      return response.data
    },
    updateTodo: async (id: string, patch: UpdateTodoPatch) => {
      const response = await request<UpdateTodoResponse>(`/api/v1/todos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      })
      return response.data
    },
    deleteTodo: async (id: string) => {
      const response = await request<DeleteTodoResponse>(`/api/v1/todos/${id}`, {
        method: 'DELETE',
      })
      return response.data
    },
  }
}
