import { getPrisma } from '../../prisma'

export const todoRepo = {
  listByUser: async (userId: string) =>
    getPrisma().todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  create: async (userId: string, title: string) =>
    getPrisma().todo.create({
      data: { userId, title },
    }),
  findById: async (id: string, userId: string) =>
    getPrisma().todo.findFirst({
      where: { id, userId },
    }),
  update: async (id: string, data: { title?: string; isDone?: boolean }) =>
    getPrisma().todo.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    }),
  deleteById: async (id: string, userId: string) =>
    getPrisma().todo.deleteMany({
      where: { id, userId },
    }),
}
