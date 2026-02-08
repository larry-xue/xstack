import { todoRepo } from './repo'

type TodoEntity = {
  id: string
  title: string
  isDone: boolean
  createdAt: Date
  updatedAt: Date
}

const formatTodo = (todo: TodoEntity) => ({
  id: todo.id,
  title: todo.title,
  isDone: todo.isDone,
  createdAt: todo.createdAt.toISOString(),
  updatedAt: todo.updatedAt.toISOString(),
})

type TodoResponse = ReturnType<typeof formatTodo>
type TodoNotFound = {
  error: 'Todo not found'
  code: 'TODO_NOT_FOUND'
  status: 404
}
type TodoBadRequest = {
  error: 'No updates provided'
  code: 'NO_UPDATES'
  status: 400
}
type UpdateResult = TodoResponse | TodoNotFound | TodoBadRequest
type DeleteResult = { ok: true } | TodoNotFound

export const todoService = {
  list: async (userId: string): Promise<TodoResponse[]> => {
    const todos = await todoRepo.listByUser(userId)
    return todos.map(formatTodo)
  },
  create: async (userId: string, title: string): Promise<TodoResponse> => {
    const todo = await todoRepo.create(userId, title)
    return formatTodo(todo)
  },
  update: async (
    userId: string,
    id: string,
    data: { title?: string; isDone?: boolean },
  ): Promise<UpdateResult> => {
    const existing = await todoRepo.findById(id, userId)
    if (!existing) {
      return {
        error: 'Todo not found' as const,
        code: 'TODO_NOT_FOUND' as const,
        status: 404 as const,
      }
    }

    const update: { title?: string; isDone?: boolean } = {}
    if (typeof data.title === 'string') {
      update.title = data.title
    }
    if (typeof data.isDone === 'boolean') {
      update.isDone = data.isDone
    }

    if (Object.keys(update).length === 0) {
      return {
        error: 'No updates provided' as const,
        code: 'NO_UPDATES' as const,
        status: 400 as const,
      }
    }

    const todo = await todoRepo.update(existing.id, update)
    return formatTodo(todo)
  },
  delete: async (userId: string, id: string): Promise<DeleteResult> => {
    const result = await todoRepo.deleteById(id, userId)
    if (result.count === 0) {
      return {
        error: 'Todo not found' as const,
        code: 'TODO_NOT_FOUND' as const,
        status: 404 as const,
      }
    }

    return { ok: true as const }
  },
}
