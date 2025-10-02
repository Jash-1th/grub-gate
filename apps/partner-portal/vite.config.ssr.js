import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// SSR-specific Vite configuration
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic',
    jsxImportSource: 'react'
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@grub-gate/ui': path.resolve(__dirname, '../../packages/ui'),
      '@grub-gate/locales': path.resolve(__dirname, '../../packages/locales'),
      '@grub-gate/config': path.resolve(__dirname, '../../packages/config'),
    },
  },
  build: {
    ssr: true,
    outDir: 'dist/server',
    rollupOptions: {
      input: './src/entry-server.jsx',
      output: {
        format: 'es',
        entryFileNames: 'main.ssr.js'
      }
    },
    // Don't minify SSR bundle for better debugging
    minify: false,
    sourcemap: true
  },
  ssr: {
    // Don't externalize these packages for SSR
    noExternal: ['@grub-gate/ui', '@grub-gate/locales', '@grub-gate/config']
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  }
})




