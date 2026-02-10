import { node } from '@elysiajs/node'
import { createAppContainer } from '@api/bootstrap/create-container'
import { loadRuntimeConfig } from '@api/core/config/runtime-config'
import { createApp } from '@api/app'

const runtimeConfig = loadRuntimeConfig()
const container = createAppContainer({ runtimeConfig })
const port = runtimeConfig.port
const hostname = '0.0.0.0'

const app = createApp({
  adapter: node(),
  container,
})
app.listen({ port, hostname })

console.log(`API listening on http://${hostname}:${port}`)
