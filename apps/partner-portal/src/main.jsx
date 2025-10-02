import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import './styles/index.css'
import './config/i18n.js'
import { initializePWA } from './pwa.js'

const rootEl = document.getElementById('root')

// Check if we're in a browser environment
if (typeof window !== 'undefined' && rootEl) {
  const app = (
    <React.StrictMode>
      <ErrorBoundary reloadOnRefresh={true}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  )

  // Check if the root has server-rendered content
  const hasServerContent = rootEl.innerHTML.trim().length > 0 && !rootEl.innerHTML.includes('ssr-error')
  
  if (hasServerContent) {
    console.log('Hydrating server-rendered content...')
    hydrateRoot(rootEl, app)
  } else {
    console.log('Rendering client-side...')
    createRoot(rootEl).render(app)
  }
}

// Initialize PWA after app initialization
initializePWA();

