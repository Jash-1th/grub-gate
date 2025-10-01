import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './config/i18n.js'
import App from './App.jsx'
import { initializePWA } from './pwa.js'
import './styles/index.css'

console.log('🚀 Client-side JavaScript is loading!')
console.log('📍 Current URL:', window.location.href)

// Always wrap with BrowserRouter for client-side
const root = document.getElementById('root')
console.log('🎯 Root element found:', !!root)
console.log('📄 Root innerHTML length:', root?.innerHTML?.length || 0)

if (root) {
  console.log('🔄 Rendering client-side app...')
  
  try {
    // Clear the existing content first to avoid hydration issues
    root.innerHTML = ''
    
    // Always use createRoot for consistency
    createRoot(root).render(
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </I18nextProvider>
    )
    console.log('✅ Client-side rendering completed!')
    
    // Initialize PWA features
    initializePWA()
  } catch (error) {
    console.error('❌ Client-side rendering failed:', error)
  }
} else {
  console.error('❌ Root element not found!')
}
