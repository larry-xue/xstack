import { node } from '@elysiajs/node'
import { createAppContainer } from './bootstrap/create-container'
import { loadRuntimeConfig } from './core/config/runtime-config'
import { createApp } from './app'

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
