import { getAccessToken } from './auth'
import { createApiClient, unwrapApiEnvelope } from '@repo/api-client'

const apiClient = createApiClient({
  getAccessToken,
})

type TodosClient = typeof apiClient.api.v1.todos
type TodosGet = TodosClient['get']
type TodosGetOptions = Parameters<TodosGet>[0]
type TodoByIdClient = ReturnType<TodosClient>
type TodoPatch = TodoByIdClient['patch']

export type TaskListQuery = NonNullable<TodosGetOptions> extends { query?: infer Query }
  ? NonNullable<Query>
  : never
type UpdateTodoPatch = NonNullable<Parameters<TodoPatch>[0]>

export const getTasks = async (query?: TaskListQuery) => {
  const response = query ? await apiClient.api.v1.todos.get({ query }) : await apiClient.api.v1.todos.get()
  return unwrapApiEnvelope(response, 'Failed to fetch todos')
}

export const createTask = async (title: string) => {
  const response = await apiClient.api.v1.todos.post({ title })
  return unwrapApiEnvelope(response, 'Failed to create todo')
}

export const updateTask = async (id: string, data: UpdateTodoPatch) => {
  const response = await apiClient.api.v1.todos({ id }).patch(data)
  return unwrapApiEnvelope(response, 'Failed to update todo')
}

export const deleteTask = async (id: string) => {
  const response = await apiClient.api.v1.todos({ id }).delete()
  return unwrapApiEnvelope(response, 'Failed to delete todo')
}

export type TaskList = Awaited<ReturnType<typeof getTasks>>
export type Task = TaskList['items'][number]
