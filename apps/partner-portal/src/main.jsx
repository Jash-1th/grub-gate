import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import './styles/index.css'
import './config/i18n.js'
import { initializePWA } from './pwa.js'

const rootEl = document.getElementById('root')
const app = (
  <React.StrictMode>
    <ErrorBoundary reloadOnRefresh={true}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)

if (rootEl && rootEl.hasChildNodes()) {
  // Hydrate SSR markup to avoid FOUC
  hydrateRoot(rootEl, app)
} else if (rootEl) {
  // CSR fallback
  createRoot(rootEl).render(app)
}

// Initialize PWA after app initialization
initializePWA();

