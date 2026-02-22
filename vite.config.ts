import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    proxy: {
      '/api/odata': {
        target: 'https://data.cityofnewyork.us',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
