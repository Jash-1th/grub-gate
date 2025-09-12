import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Accept connections from any IP
    port: 3000,      // Standard dev port
    strictPort: false, // Allow fallback to other ports
    open: false,     // Don't auto-open browser (prevents conflicts)
    cors: true,      // Enable CORS for development
    
    // Robust HMR Configuration for Windows
    hmr: {
      port: 24678,
      host: '0.0.0.0', // Bind to all interfaces
      clientPort: undefined, // Let Vite determine the client port automatically
      overlay: true,
      // Force WebSocket connection (bypasses HTTP fallback issues)
      protocol: 'ws'
    },
    
    // Watch configuration for better file detection on Windows
    watch: {
      usePolling: true,
      interval: 100,
      // Ignore common directories that cause performance issues
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**']
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
    include: ['react', 'react-dom', 'react-router-dom'],
    // Force dependency pre-bundling for faster startup
    force: false
  },
  
  // Resolve configuration for better module resolution
  resolve: {
    alias: {
      // Add common aliases if needed
    }
  }
})
