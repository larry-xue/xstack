import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const target = import.meta.env.VITE_API_URL;

// https://vite.dev/config/
export default defineConfig(() => {

  return {
    plugins: [react()],
    server: {
      port: 5173,
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
