import { AppError, ErrorCodeEnum } from '../../../../core/http/errors'
import type { TaskDto, TaskPatch } from '../../domain/task'
import { toTaskDto } from '../../domain/task'
import type { TaskRepository } from '../ports/task-repository'

export type TaskUseCases = {
  list: (userId: string) => Promise<TaskDto[]>
  create: (userId: string, title: string) => Promise<TaskDto>
  update: (userId: string, taskId: string, patch: TaskPatch) => Promise<TaskDto>
  delete: (userId: string, taskId: string) => Promise<{ ok: true }>
}

const toValidatedPatch = (patch: TaskPatch): TaskPatch => {
  const validatedPatch: TaskPatch = {}

  if (typeof patch.title === 'string') {
    validatedPatch.title = patch.title
  }

  if (typeof patch.isDone === 'boolean') {
    validatedPatch.isDone = patch.isDone
  }

  return validatedPatch
}

export const createTaskUseCases = (taskRepository: TaskRepository): TaskUseCases => ({
  list: async (userId: string) => {
    const tasks = await taskRepository.listByUser(userId)
    return tasks.map(toTaskDto)
  },

  create: async (userId: string, title: string) => {
    const task = await taskRepository.create({ userId, title })
    return toTaskDto(task)
  },

  update: async (userId: string, taskId: string, patch: TaskPatch) => {
    const validatedPatch = toValidatedPatch(patch)
    if (Object.keys(validatedPatch).length === 0) {
      throw new AppError({
        code: ErrorCodeEnum.TASK_NO_UPDATES,
        status: 400,
        message: 'No updates provided',
      })
    }

    const task = await taskRepository.updateForUser({
      userId,
      taskId,
      patch: validatedPatch,
    })

    if (!task) {
      throw new AppError({
        code: ErrorCodeEnum.TASK_NOT_FOUND,
        status: 404,
        message: 'Task not found',
      })
    }

    return toTaskDto(task)
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
