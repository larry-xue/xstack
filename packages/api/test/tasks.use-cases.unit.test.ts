import { describe, expect, test } from 'vitest'
import { AppError, ErrorCodeEnum } from '../src/core/http/errors'
import type { TaskRepository } from '../src/modules/tasks/application/ports/task-repository'
import { createTaskUseCases } from '../src/modules/tasks/application/use-cases'
import {
  TaskSortByEnum,
  TaskSortOrderEnum,
  TaskStatusFilterEnum,
  type TaskEntity,
  type TaskListQuery,
} from '../src/modules/tasks/domain/task'

const baseTime = new Date('2026-02-09T00:00:00.000Z')

type TaskRecord = TaskEntity & { userId: string }

const asListQuery = (query: Partial<TaskListQuery> = {}): TaskListQuery => ({
  page: query.page ?? 1,
  pageSize: query.pageSize ?? 10,
  sortBy: query.sortBy ?? TaskSortByEnum.CREATED_AT,
  sortOrder: query.sortOrder ?? TaskSortOrderEnum.DESC,
  status: query.status ?? TaskStatusFilterEnum.ALL,
})

const createRepositoryStub = (): TaskRepository => {
  const tasksById = new Map<string, TaskRecord>()
  let counter = 1

  return {
    listByUser: async ({ userId, query }) => {
      let items = Array.from(tasksById.values()).filter(task => task.userId === userId)

      if (query.status === TaskStatusFilterEnum.TODO) {
        items = items.filter(task => !task.isDone)
      } else if (query.status === TaskStatusFilterEnum.DONE) {
        items = items.filter(task => task.isDone)
      }

      const direction = query.sortOrder === TaskSortOrderEnum.ASC ? 1 : -1
      items.sort((a, b) => {
        if (query.sortBy === TaskSortByEnum.TITLE) {
          return direction * a.title.localeCompare(b.title)
        }

        const aTime =
          query.sortBy === TaskSortByEnum.UPDATED_AT ? a.updatedAt.getTime() : a.createdAt.getTime()
        const bTime =
          query.sortBy === TaskSortByEnum.UPDATED_AT ? b.updatedAt.getTime() : b.createdAt.getTime()

        return direction * (aTime - bTime)
      })

      const total = items.length
      const skip = (query.page - 1) * query.pageSize
      const pageItems = items.slice(skip, skip + query.pageSize)

      return {
        items: pageItems.map(({ userId: _userId, ...task }) => task),
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        status: query.status,
      }
    },
    create: async ({ userId, title }) => {
      const id = `${userId}-${counter}`
      counter += 1
      const createdAt = new Date(baseTime.getTime() + counter * 1000)
      const task: TaskRecord = {
        id,
        userId,
        title,
        isDone: false,
        createdAt,
        updatedAt: createdAt,
      }
      tasksById.set(id, task)
      const { userId: _userId, ...entity } = task
      return entity
    },
    updateForUser: async ({ userId, taskId, patch }) => {
      const task = tasksById.get(taskId)
      if (!task || task.userId !== userId) {
        return false
      }

      tasksById.set(taskId, {
        ...task,
        title: patch.title ?? task.title,
        isDone: patch.isDone ?? task.isDone,
        updatedAt: new Date(task.updatedAt.getTime() + 1000),
      })
      return true
    },
    deleteForUser: async ({ userId, taskId }) => {
      const task = tasksById.get(taskId)
      if (!task || task.userId !== userId) {
        return false
      }

      tasksById.delete(taskId)
      return true
    },
  }
}

describe('Task use cases', () => {
  test('create/list returns paged task DTOs', async () => {
    const useCases = createTaskUseCases(createRepositoryStub())

    const created = await useCases.create('user-1', 'Ship plan')
    expect(created.title).toBe('Ship plan')

    await useCases.create('user-1', 'Write docs')
    await useCases.create('user-2', 'Other tenant')

    const list = await useCases.list(
      'user-1',
      asListQuery({
        page: 1,
        pageSize: 1,
        sortBy: TaskSortByEnum.TITLE,
        sortOrder: TaskSortOrderEnum.ASC,
      }),
    )

    expect(list.total).toBe(2)
    expect(list.items).toHaveLength(1)
    expect(list.totalPages).toBe(2)
    expect(list.items[0]?.id).toBe(created.id)
  })

  test('update returns action success envelope payload shape', async () => {
    const useCases = createTaskUseCases(createRepositoryStub())
    const created = await useCases.create('user-1', 'One task')

    const result = await useCases.update('user-1', created.id, {
      title: 'One task updated',
      isDone: true,
    })

    expect(result).toEqual({ ok: true })
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
