import { initServer } from '@ts-rest/fastify'
import { contract } from '@repo/contracts'
import { FastifyPluginAsync } from 'fastify'

export const autoPrefix = ''

const s = initServer()

const router = s.router<typeof contract>(contract, {
  health: s.route(contract.health, async _args => {
    return { status: 200, body: { ok: true } } as const
  }),
})

const health: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.register(s.plugin(router))
}

export default health
