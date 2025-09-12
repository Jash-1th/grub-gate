import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
   
    hmr: {
      overlay: true,
      port: 24679,
      host: 'localhost',
      clientPort: 24679
    }
  },
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
