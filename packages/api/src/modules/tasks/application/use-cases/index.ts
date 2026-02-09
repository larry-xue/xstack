import { AppError, ErrorCodeEnum } from '../../../../core/http/errors'
import type { TaskDto, TaskListPageDto, TaskListQuery, TaskPatch } from '../../domain/task'
import { toTaskDto, toTaskListPageDto } from '../../domain/task'
import type { TaskRepository } from '../ports/task-repository'

export type TaskUseCases = {
  list: (userId: string, query: TaskListQuery) => Promise<TaskListPageDto>
  create: (userId: string, title: string) => Promise<TaskDto>
  update: (userId: string, taskId: string, patch: TaskPatch) => Promise<{ ok: true }>
  delete: (userId: string, taskId: string) => Promise<{ ok: true }>
}

export const createTaskUseCases = (taskRepository: TaskRepository): TaskUseCases => ({
  list: async (userId: string, query: TaskListQuery) => {
    const page = await taskRepository.listByUser({
      userId,
      query,
    })
    return toTaskListPageDto(page)
  },

  create: async (userId: string, title: string) => {
    const task = await taskRepository.create({ userId, title })
    return toTaskDto(task)
  },

  update: async (userId: string, taskId: string, patch: TaskPatch) => {
    const updated = await taskRepository.updateForUser({
      userId,
      taskId,
      patch,
    })

    if (!updated) {
      throw new AppError({
        code: ErrorCodeEnum.TASK_NOT_FOUND,
        status: 404,
        message: 'Task not found',
      })
    }

    return { ok: true as const }
  },

  delete: async (userId: string, taskId: string) => {
    const deleted = await taskRepository.deleteForUser({ userId, taskId })
    if (!deleted) {
      throw new AppError({
        code: ErrorCodeEnum.TASK_NOT_FOUND,
        status: 404,
        message: 'Task not found',
      })
    }

    return { ok: true as const }
  },
})
