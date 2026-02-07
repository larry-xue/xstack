// This file contains code that we reuse between our tests.
import * as path from 'node:path'
import { afterEach } from 'vitest'
const helper = require('fastify-cli/helper.js')

const AppPath = path.join(__dirname, '..', 'dist', 'app.js')

// Fill in this config with all the configurations
// needed for testing the application
function config() {
  return {
    skipOverride: true, // Register our application with fastify-plugin
  }
}

// Automatically build and tear down our instance
async function build() {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath]

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const app = await helper.build(argv, config())

  // Tear down our app after we are done
  // eslint-disable-next-line no-void
  afterEach(async () => {
    await app.close()
  })

  return app
}

export { config, build }
