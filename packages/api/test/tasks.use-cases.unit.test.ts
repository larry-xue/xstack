import { describe, expect, test } from 'vitest'
import { AppError, ErrorCodeEnum } from '../src/core/http/errors'
import { createTaskUseCases } from '../src/modules/tasks/application/use-cases'
import type { TaskRepository } from '../src/modules/tasks/application/ports/task-repository'
import type { TaskEntity } from '../src/modules/tasks/domain/task'

const now = new Date('2026-02-09T00:00:00.000Z')

const makeTask = (id: string, title: string, isDone = false): TaskEntity => ({
  id,
  title,
  isDone,
  createdAt: now,
  updatedAt: now,
})

const createRepositoryStub = (): TaskRepository => {
  const tasksById = new Map<string, TaskEntity>()

  return {
    listByUser: async () => Array.from(tasksById.values()),
    create: async ({ userId, title }) => {
      const task = makeTask(`${userId}-${tasksById.size + 1}`, title)
      tasksById.set(task.id, task)
      return task
    },
    updateForUser: async ({ taskId, patch }) => {
      const task = tasksById.get(taskId)
      if (!task) {
        return null
      }

      const updated: TaskEntity = {
        ...task,
        title: patch.title ?? task.title,
        isDone: patch.isDone ?? task.isDone,
        updatedAt: now,
      }
      tasksById.set(taskId, updated)
      return updated
    },
    deleteForUser: async ({ taskId }) => tasksById.delete(taskId),
  }
}

describe('Task use cases', () => {
  test('create/list returns task DTOs', async () => {
    const useCases = createTaskUseCases(createRepositoryStub())

    const created = await useCases.create('user-1', 'Ship plan')
    expect(created.title).toBe('Ship plan')
    expect(created.createdAt).toBe(now.toISOString())

    const list = await useCases.list('user-1')
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe(created.id)
  })

  test('update throws TASK_NO_UPDATES on empty patch', async () => {
    const useCases = createTaskUseCases(createRepositoryStub())
    await useCases.create('user-1', 'One task')

    await expect(useCases.update('user-1', 'user-1-1', {})).rejects.toMatchObject({
      code: ErrorCodeEnum.TASK_NO_UPDATES,
    } satisfies Partial<AppError>)
  })

  test('update/delete throws TASK_NOT_FOUND for missing task', async () => {
    const useCases = createTaskUseCases(createRepositoryStub())

    await expect(useCases.update('user-1', 'missing-id', { title: 'x' })).rejects.toMatchObject({
      code: ErrorCodeEnum.TASK_NOT_FOUND,
    } satisfies Partial<AppError>)

    await expect(useCases.delete('user-1', 'missing-id')).rejects.toMatchObject({
      code: ErrorCodeEnum.TASK_NOT_FOUND,
    } satisfies Partial<AppError>)
  })
})
