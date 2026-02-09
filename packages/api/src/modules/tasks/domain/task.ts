export type TaskEntity = {
  id: string
  title: string
  isDone: boolean
  createdAt: Date
  updatedAt: Date
}

export type TaskPatch = {
  title?: string
  isDone?: boolean
}

export type TaskDto = {
  id: string
  title: string
  isDone: boolean
  createdAt: string
  updatedAt: string
}

export const toTaskDto = (task: TaskEntity): TaskDto => ({
  id: task.id,
  title: task.title,
  isDone: task.isDone,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
})
