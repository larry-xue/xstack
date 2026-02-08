import { node } from '@elysiajs/node'
import { createApp } from '@repo/api'

const port = Number(process.env.PORT ?? 54545)
const hostname = '0.0.0.0'

const app = createApp({ adapter: node() })
app.listen({ port, hostname })

console.log(`API listening on http://${hostname}:${port}`)
