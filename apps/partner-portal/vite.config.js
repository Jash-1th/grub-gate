import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// Create __dirname and __filename equivalents in ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Client-side Vite configuration for Partner Portal
export default ({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  
  return defineConfig({
    define: {
      // Only expose VITE_ prefixed environment variables for security
      'import.meta.env': env,
    },
    plugins: [
      react({
        jsxRuntime: 'automatic',
        jsxImportSource: 'react'
      }),
      // Copy service workers to dist root for proper registration
      viteStaticCopy({
        targets: [
          {
            src: 'public/service-worker.js',
            dest: '.'
          },
          {
            src: 'public/firebase-messaging-sw.js',
            dest: '.'
          }
        ]
      })
    ],
    envPrefix: 'VITE_',
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@grub-gate/ui': path.resolve(__dirname, '../../packages/ui'),
        '@grub-gate/locales': path.resolve(__dirname, '../../packages/locales'),
        '@grub-gate/config': path.resolve(__dirname, '../../packages/config'),
      },
    },
    
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      open: false,
      cors: true,
      
      // Proxy API calls to backend
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          ws: true,
        }
      }
    },
    
    build: {
      outDir: 'dist/client',
      manifest: true, // Generate manifest.json for SSR
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
        output: {
          manualChunks: undefined
        }
      },
      // Copy public assets including service workers
      copyPublicDir: true,
      sourcemap: true,
      minify: 'terser',
      target: 'esnext'
    },
    
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'recharts'],
      force: false
    },
    
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react'
    }
  })
}