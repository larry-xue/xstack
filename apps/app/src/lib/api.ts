import { getAccessToken } from './auth'
import { createApiClient } from '@repo/api-client'
import type { Task as ApiTask } from '@repo/api-client'
import type { UpdateTodoPatch } from '@repo/api-client'

const apiClient = createApiClient({
  getAccessToken,
})

export type Task = ApiTask

export const createTask = (title: string) => apiClient.createTodo(title)

export const updateTask = (id: string, data: UpdateTodoPatch) => apiClient.updateTodo(id, data)

export const deleteTask = (id: string) => apiClient.deleteTodo(id)

export const getTasks = () => apiClient.getTodos()
