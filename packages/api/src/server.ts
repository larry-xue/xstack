import { node } from '@elysiajs/node'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local', quiet: true })

const { createApp } = await import('./app.js')

const port = Number(process.env.PORT ?? 54545)
const hostname = '0.0.0.0'

const app = createApp({ adapter: node() })
app.listen({ port, hostname })

console.log(`API listening on http://${hostname}:${port}`)
