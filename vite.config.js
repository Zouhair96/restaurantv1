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
    // Netlify Dev handles proxying /.netlify/functions and /api
    // The hardcoded localhost:8888 can cause issues if that port is blocked.
    // proxy: {
    //   '/.netlify/functions': {
    //     target: 'http://localhost:8888',
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   '/api': {
    //     target: 'http://localhost:8888',
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  }
})
