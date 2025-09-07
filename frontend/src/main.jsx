import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n'
import App from './App.jsx'
import ScrollToTop from './components/common/ScrollToTop'

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grub-red mx-auto mb-4"></div>
      <p className="text-gray-600">Loading GrubGate...</p>
    </div>
  </div>
);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <Suspense fallback={<LoadingFallback />}>
        <BrowserRouter>
          <ScrollToTop />
          <App />
        </BrowserRouter>
      </Suspense>
    </StrictMode>
  );
}
