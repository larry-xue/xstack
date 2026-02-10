import type { Prisma, PrismaClient } from '@prisma/client'
import type { TaskRepository } from '@api/modules/tasks/application/ports/task-repository'
import {
  TaskSortByEnum,
  TaskStatusFilterEnum,
  type TaskEntity,
  type TaskListPage,
} from '@api/modules/tasks/domain/task'

const toTaskEntity = (task: {
  id: string
  title: string
  isDone: boolean
  createdAt: Date
  updatedAt: Date
}): TaskEntity => ({
  id: task.id,
  title: task.title,
  isDone: task.isDone,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
})

export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listByUser(input: {
    userId: string
    query: {
      page: number
      pageSize: number
      sortBy: 'createdAt' | 'updatedAt' | 'title'
      sortOrder: 'asc' | 'desc'
      status: 'all' | 'todo' | 'done'
    }
  }): Promise<TaskListPage> {
    const where: Prisma.TodoWhereInput = {
      userId: input.userId,
    }

    if (input.query.status === TaskStatusFilterEnum.DONE) {
      where.isDone = true
    } else if (input.query.status === TaskStatusFilterEnum.TODO) {
      where.isDone = false
    }

    const orderBy: Prisma.TodoOrderByWithRelationInput =
      input.query.sortBy === TaskSortByEnum.TITLE
        ? { title: input.query.sortOrder }
        : input.query.sortBy === TaskSortByEnum.UPDATED_AT
          ? { updatedAt: input.query.sortOrder }
          : { createdAt: input.query.sortOrder }

    const skip = (input.query.page - 1) * input.query.pageSize

    const [total, tasks] = await this.prisma.$transaction([
      this.prisma.todo.count({ where }),
      this.prisma.todo.findMany({
        where,
        orderBy,
        skip,
        take: input.query.pageSize,
      }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / input.query.pageSize))

    return {
      items: tasks.map(toTaskEntity),
      total,
      page: input.query.page,
      pageSize: input.query.pageSize,
      totalPages,
      sortBy: input.query.sortBy,
      sortOrder: input.query.sortOrder,
      status: input.query.status,
    }
  }

  async create(input: { userId: string; title: string }): Promise<TaskEntity> {
    const task = await this.prisma.todo.create({
      data: {
        userId: input.userId,
        title: input.title,
      },
    })

    return toTaskEntity(task)
  }

  async updateForUser(input: {
    userId: string
    taskId: string
    patch: { title?: string; isDone?: boolean }
  }): Promise<boolean> {
    const now = new Date()

    const updated = await this.prisma.todo.updateMany({
      where: {
        id: input.taskId,
        userId: input.userId,
      },
      data: {
        ...input.patch,
        updatedAt: now,
      },
    })

    return updated.count > 0
  }

  async deleteForUser(input: { userId: string; taskId: string }): Promise<boolean> {
    const deleted = await this.prisma.todo.deleteMany({
      where: {
        id: input.taskId,
        userId: input.userId,
      },
    })

    return deleted.count > 0
  }
}
