import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    host: true,
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:8888', // Netlify Dev default port
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8888', // Netlify Dev default port
        changeOrigin: true,
        secure: false,
      },
    },
  }
})
