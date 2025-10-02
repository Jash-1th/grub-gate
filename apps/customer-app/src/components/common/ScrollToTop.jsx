// src/components/common/ScrollToTop.jsx
import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, key } = useLocation();

  // Use useEffect for SSR compatibility, useLayoutEffect for client-side performance
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
  
  useIsomorphicLayoutEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Disable browser scroll restoration completely
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Force scroll to top immediately
    const forceScrollToTop = () => {
      // Multiple scroll methods for maximum compatibility
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Handle any custom scroll containers
      const scrollContainers = document.querySelectorAll('main, .app-content, #root, [data-scroll="true"]');
      scrollContainers.forEach(container => {
        if (container) {
          container.scrollTop = 0;
          if (container.scrollTo) {
            container.scrollTo(0, 0);
          }
        }
      });
    };

    // Execute immediately in layout effect
    forceScrollToTop();

    // Also execute after any potential async operations
    const timeoutId = setTimeout(forceScrollToTop, 0);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname, key]); // Include key to handle same-route navigations

  return null;
};

export default ScrollToTop;
