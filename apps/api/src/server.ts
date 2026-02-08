import { createApp } from './app'

const port = Number(process.env.PORT ?? 54545)
const hostname = '0.0.0.0'

const app = createApp()
app.listen({ port, hostname })

console.log(`API listening on http://${hostname}:${port}`)
