import type { PrismaClient } from '@prisma/client'
import type { TaskRepository } from '../application/ports/task-repository'
import type { TaskEntity } from '../domain/task'

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

  async listByUser(userId: string): Promise<TaskEntity[]> {
    const tasks = await this.prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return tasks.map(toTaskEntity)
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
  }): Promise<TaskEntity | null> {
    const now = new Date()

    const task = await this.prisma.$transaction(async tx => {
      const updated = await tx.todo.updateMany({
        where: {
          id: input.taskId,
          userId: input.userId,
        },
        data: {
          ...input.patch,
          updatedAt: now,
        },
      })

      if (updated.count === 0) {
        return null
      }

      return tx.todo.findFirst({
        where: {
          id: input.taskId,
          userId: input.userId,
        },
      })
    })

    if (!task) {
      return null
    }

    return toTaskEntity(task)
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
