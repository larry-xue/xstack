import type {
  TaskEntity,
  TaskListPage,
  TaskListQuery,
  TaskPatch,
} from '@api/modules/tasks/domain/task'

export interface TaskRepository {
  listByUser(input: { userId: string; query: TaskListQuery }): Promise<TaskListPage>
  create(input: { userId: string; title: string }): Promise<TaskEntity>
  updateForUser(input: { userId: string; taskId: string; patch: TaskPatch }): Promise<boolean>
  deleteForUser(input: { userId: string; taskId: string }): Promise<boolean>
}
