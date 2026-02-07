import { expect, test } from 'vitest'

import Fastify from 'fastify'
import Support from '../../src/server/plugins/support'

test('support works standalone', async () => {
  const fastify = Fastify()
  // eslint-disable-next-line no-void
  void fastify.register(Support)
  await fastify.ready()

  expect(fastify.someSupport()).toBe('hugs')
})
