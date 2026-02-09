import type { TaskEntity, TaskPatch } from '../../domain/task'

export interface TaskRepository {
  listByUser(userId: string): Promise<TaskEntity[]>
  create(input: { userId: string; title: string }): Promise<TaskEntity>
  updateForUser(input: {
    userId: string
    taskId: string
    patch: TaskPatch
  }): Promise<TaskEntity | null>
  deleteForUser(input: { userId: string; taskId: string }): Promise<boolean>
}
