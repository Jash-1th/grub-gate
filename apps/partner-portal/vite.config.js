import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default ({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  
  return defineConfig({
    define: {
      // Only expose VITE_ prefixed environment variables for security
      'import.meta.env': env,
    },
    plugins: [react({
      // Ensure proper JSX handling
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    })],
    envPrefix: 'VITE_',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@grub-gate/ui': path.resolve(__dirname, '../../packages/ui'),
        '@grub-gate/locales': path.resolve(__dirname, '../../packages/locales'),
        '@grub-gate/config': path.resolve(__dirname, '../../packages/config'),
      },
    },
    esbuild: {
      // Ensure proper JSX handling
      jsx: 'automatic',
      jsxImportSource: 'react'
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      esbuildOptions: {
        loader: {
          '.js': 'jsx'
        }
      }
    },
    server: {
      port: 5173,
      host: true,
      cors: true,
      hmr: {
        port: 24680, // Changed to avoid conflicts
        host: 'localhost', // Changed from 0.0.0.0 to localhost
        overlay: true
      }
    },
    build: {
      outDir: 'dist/client',
      sourcemap: true,
      minify: 'terser',
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    ssr: {
      // Don't externalize these packages for SSR
      noExternal: ['@grub-gate/ui', '@grub-gate/locales', '@grub-gate/config']
    }
  })
}

