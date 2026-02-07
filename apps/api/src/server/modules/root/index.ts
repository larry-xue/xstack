import { FastifyPluginAsync } from 'fastify'

export const autoPrefix = ''

const root: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get('/', async function (_request, _reply) {
    return { root: true }
  })
}

export default root
