import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    watch: {
      // Necesario porque el proyecto está en una unidad de red
      // Node.js no puede usar el watcher nativo en drives de red de Windows
      usePolling: true,
      interval: 1500,
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
})