import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const target = 'http://localhost:54545'
  return {
    plugins: [react()],
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
