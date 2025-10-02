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

  // Check if SSR content exists
  if (rootEl.hasChildNodes() && rootEl.innerHTML.trim() !== '') {
    // Hydrate SSR markup
    console.log('Hydrating SSR content...')
    hydrateRoot(rootEl, app)
  } else {
    // CSR fallback
    console.log('Rendering client-side...')
    createRoot(rootEl).render(app)
  }
}

// Initialize PWA after app initialization
initializePWA();

