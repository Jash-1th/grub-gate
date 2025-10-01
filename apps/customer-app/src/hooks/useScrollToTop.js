// Custom hook for scroll restoration
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Disable browser scroll restoration
    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Force scroll to top on every route change
      const scrollToTop = () => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Handle any scrollable containers
        const containers = document.querySelectorAll('main, .app-content, #root');
        containers.forEach(container => {
          if (container) {
            container.scrollTop = 0;
          }
        });
      };

      // Execute immediately and with fallback
      scrollToTop();
      
      // Use both requestAnimationFrame and setTimeout for reliability
      requestAnimationFrame(scrollToTop);
      setTimeout(scrollToTop, 0);
      setTimeout(scrollToTop, 100);
    }
  }, [location.pathname, location.search, location.hash]);
};
