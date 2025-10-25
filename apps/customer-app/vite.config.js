import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default ({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Log loaded environment variables (for debugging)
  console.log('Environment variables:', Object.keys(env));

  return defineConfig({
    define: {
      // Only expose VITE_ prefixed environment variables for security
      'import.meta.env': env,
    },
    plugins: [
      react({
        // Ensure proper JSX handling
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
    
    server: {
      // Enable source maps for better debugging
      sourcemap: true,
      host: '0.0.0.0',
      port: 3000,
      strictPort: false,
      open: false,
      cors: true,
      
      // HMR Configuration
      hmr: {
        port: 24678,
        host: 'localhost',
        clientPort: 24678,
        overlay: true,
        protocol: 'ws'
      },
      
      // Watch configuration
      watch: {
        usePolling: true,
        interval: 100,
        ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**']
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
      outDir: 'dist/client',
      rollupOptions: {
        output: {
          manualChunks: undefined
        },
        input: {
          main: './index.html'
        }
      },
      // Copy public assets including service workers
      copyPublicDir: true,
      // Ensure proper source maps for debugging
      sourcemap: true,
      // Optimize for better SSR compatibility
      minify: 'terser',
      target: 'esnext'
    },
    
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      force: false
    },
    
    resolve: {
      alias: {
        // Add common aliases if needed
      }
    },
    
    esbuild: {
      // Ensure proper JSX handling
      jsx: 'automatic',
      jsxImportSource: 'react'
    }
  });
};
