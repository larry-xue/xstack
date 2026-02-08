import { AppError } from '../../schemas/error'
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
  ): Promise<TodoResponse> => {
    const existing = await todoRepo.findById(id, userId)
    if (!existing) {
      throw new AppError({
        code: 'TODO_NOT_FOUND',
        status: 404,
        message: 'Todo not found',
      })
    }

    const update: { title?: string; isDone?: boolean } = {}
    if (typeof data.title === 'string') {
      update.title = data.title
    }
    if (typeof data.isDone === 'boolean') {
      update.isDone = data.isDone
    }

    if (Object.keys(update).length === 0) {
      throw new AppError({
        code: 'NO_UPDATES',
        status: 400,
        message: 'No updates provided',
      })
    }

    const todo = await todoRepo.update(existing.id, update)
    return formatTodo(todo)
  },
  delete: async (userId: string, id: string): Promise<{ ok: true }> => {
    const result = await todoRepo.deleteById(id, userId)
    if (result.count === 0) {
      throw new AppError({
        code: 'TODO_NOT_FOUND',
        status: 404,
        message: 'Todo not found',
      })
    }

    return { ok: true as const }
  },
}
