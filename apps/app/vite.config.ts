import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tanstackRouter from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(() => {
  const target = 'http://localhost:54545'
  return {
    plugins: [tanstackRouter(), react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 8878,
      proxy: {
        '/health': {
          target,
          changeOrigin: true,
        },
        '/api': {
          target,
          changeOrigin: true,
        },
      },
    },
  }
})
