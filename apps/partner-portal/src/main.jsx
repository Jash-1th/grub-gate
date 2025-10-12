import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import './styles/index.css';
import './styles/onboarding.css';
import './styles/mobile-responsive.css';
import './config/i18n.js'
import { initializePWA } from './pwa.js'
import './utils/debug-styles.js'
import './utils/fontawesome.js'

const rootEl = document.getElementById('root')
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
  // Only hydrate if there's actual React-rendered content (not just placeholder text)
  const hasServerContent = rootEl.innerHTML.trim().length > 0 && 
                           !rootEl.innerHTML.includes('ssr-error') &&
                           !rootEl.innerHTML.includes('<!--app-html-->') &&
                           !rootEl.innerHTML.includes('Loading GrubGate Partner Portal') &&
                           (rootEl.innerHTML.includes('data-reactroot') || 
                            rootEl.innerHTML.includes('class=') || 
                            rootEl.innerHTML.includes('className=') ||
                            rootEl.innerHTML.includes('<div') ||
                            rootEl.innerHTML.includes('<nav') ||
                            rootEl.innerHTML.includes('<main'))
  
  if (hasServerContent) {
    console.log('Hydrating server-rendered content...')
    try {
      hydrateRoot(rootEl, app)
    } catch (error) {
      console.warn('Hydration failed, falling back to client-side rendering:', error)
      rootEl.innerHTML = ''
      createRoot(rootEl).render(app)
    }
  } else {
    console.log('Rendering client-side...')
    createRoot(rootEl).render(app)
  }
}

// Initialize PWA after app initialization - only in browser environment
if (typeof window !== 'undefined') {
  initializePWA();
}

