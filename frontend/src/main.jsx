import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const container = document.getElementById('root');
if (container) {
  // Check if the app was server-rendered
  const isServerRendered = container.innerHTML.trim() !== '' && !container.innerHTML.includes('Loading Grub-Gate...');
  
  if (isServerRendered) {
    // Hydrate for SSR
    hydrateRoot(container, 
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>
    );
  } else {
    // Client-side render for development
    createRoot(container).render(
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>
    );
  }
}
