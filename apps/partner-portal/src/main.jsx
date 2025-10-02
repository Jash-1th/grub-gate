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

  // For now, always use CSR to avoid hydration mismatches
  // We can enable SSR later once we ensure server/client consistency
  console.log('Rendering client-side...')
  createRoot(rootEl).render(app)
}

// Initialize PWA after app initialization
initializePWA();

