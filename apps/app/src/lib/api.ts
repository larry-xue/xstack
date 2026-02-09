import { getAccessToken } from './auth'
import { createApiClient } from '@repo/api-client'
import type { ListTodosQuery, Task as ApiTask, TaskList as ApiTaskList } from '@repo/api-client'
import type { UpdateTodoPatch } from '@repo/api-client'

const apiClient = createApiClient({
  getAccessToken,
})

export type Task = ApiTask
export type TaskList = ApiTaskList
export type TaskListQuery = ListTodosQuery

export const createTask = (title: string) => apiClient.createTodo(title)

export const updateTask = (id: string, data: UpdateTodoPatch) => apiClient.updateTodo(id, data)

export const deleteTask = (id: string) => apiClient.deleteTodo(id)

export const getTasks = (query?: TaskListQuery) => apiClient.getTodos(query)
