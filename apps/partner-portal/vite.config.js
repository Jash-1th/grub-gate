import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default ({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  
  return defineConfig({
    base: mode === 'production' ? '/' : '/',
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
      },
      // Proxy API calls to backend
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    },
    build: {
      manifest: true, // ✅ Generate manifest.json for dynamic asset loading
      outDir: 'dist/client',
      sourcemap: true,
      minify: 'terser',
      target: 'esnext',
      assetsDir: 'assets',
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
        output: {
          manualChunks: undefined,
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js'
        }
      }
    },
    ssr: {
      // Don't externalize these packages for SSR
      noExternal: ['@grub-gate/ui', '@grub-gate/locales', '@grub-gate/config']
    }
  })
}

