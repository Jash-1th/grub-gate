import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    ssr: true,
    outDir: 'dist/server',
    rollupOptions: {
      input: 'src/main.ssr.jsx',
      output: {
        format: 'es'
      }
    }
  },
  // Optimize deps to exclude Leaflet from SSR
  optimizeDeps: {
    exclude: ['leaflet', 'react-leaflet']
  },
  // Resolve alias to provide SSR-safe stubs for Leaflet
  resolve: {
    alias: {
      'leaflet': './src/utils/leaflet-stub.js',
      'react-leaflet': './src/utils/react-leaflet-stub.js'
    }
  }
})
