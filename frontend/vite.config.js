import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This proxy is important for your API calls to work in development
    proxy: {
      '/api': {
        target: 'http://localhost:5050', // Your backend server address
        changeOrigin: true,
      },
    },
  },
})
