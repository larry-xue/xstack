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

export const TaskSortByEnum = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  TITLE: 'title',
} as const

export type TaskSortBy = (typeof TaskSortByEnum)[keyof typeof TaskSortByEnum]

export const TaskSortOrderEnum = {
  ASC: 'asc',
  DESC: 'desc',
} as const

export type TaskSortOrder = (typeof TaskSortOrderEnum)[keyof typeof TaskSortOrderEnum]

export const TaskStatusFilterEnum = {
  ALL: 'all',
  TODO: 'todo',
  DONE: 'done',
} as const

export type TaskStatusFilter = (typeof TaskStatusFilterEnum)[keyof typeof TaskStatusFilterEnum]

export type TaskListQuery = {
  page: number
  pageSize: number
  sortBy: TaskSortBy
  sortOrder: TaskSortOrder
  status: TaskStatusFilter
}

export type TaskListQueryInput = Partial<TaskListQuery>

export const defaultTaskListQuery: TaskListQuery = {
  page: 1,
  pageSize: 10,
  sortBy: TaskSortByEnum.CREATED_AT,
  sortOrder: TaskSortOrderEnum.DESC,
  status: TaskStatusFilterEnum.ALL,
}

export const withTaskListDefaults = (query: TaskListQueryInput = {}): TaskListQuery => ({
  page: query.page ?? defaultTaskListQuery.page,
  pageSize: query.pageSize ?? defaultTaskListQuery.pageSize,
  sortBy: query.sortBy ?? defaultTaskListQuery.sortBy,
  sortOrder: query.sortOrder ?? defaultTaskListQuery.sortOrder,
  status: query.status ?? defaultTaskListQuery.status,
})

export type TaskListPage = {
  items: TaskEntity[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  sortBy: TaskSortBy
  sortOrder: TaskSortOrder
  status: TaskStatusFilter
}

export type TaskDto = {
  id: string
  title: string
  isDone: boolean
  createdAt: string
  updatedAt: string
}

export type TaskListPageDto = {
  items: TaskDto[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  sortBy: TaskSortBy
  sortOrder: TaskSortOrder
  status: TaskStatusFilter
}

export const toTaskDto = (task: TaskEntity): TaskDto => ({
  id: task.id,
  title: task.title,
  isDone: task.isDone,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
})

export const toTaskListPageDto = (page: TaskListPage): TaskListPageDto => ({
  items: page.items.map(toTaskDto),
  total: page.total,
  page: page.page,
  pageSize: page.pageSize,
  totalPages: page.totalPages,
  sortBy: page.sortBy,
  sortOrder: page.sortOrder,
  status: page.status,
})

export class TaskModel {
  private constructor(private readonly task: TaskEntity) {}

  static fromEntity(task: TaskEntity) {
    return new TaskModel(task)
  }

  rename(title: string) {
    return new TaskModel({
      ...this.task,
      title,
      updatedAt: new Date(),
    })
  }

  markDone() {
    return new TaskModel({
      ...this.task,
      isDone: true,
      updatedAt: new Date(),
    })
  }

  markTodo() {
    return new TaskModel({
      ...this.task,
      isDone: false,
      updatedAt: new Date(),
    })
  }

  applyPatch(patch: TaskPatch) {
    let next = TaskModel.fromEntity(this.task)

    if (typeof patch.title === 'string') {
      next = next.rename(patch.title)
    }

    if (typeof patch.isDone === 'boolean') {
      next = patch.isDone ? next.markDone() : next.markTodo()
    }

    return next
  }

  toEntity(): TaskEntity {
    return this.task
  }

  toDto(): TaskDto {
    return toTaskDto(this.task)
  }
}
