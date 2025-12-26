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
      const scrollingEl = document.scrollingElement || document.documentElement;

      // Multiple scroll methods for maximum compatibility
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (scrollingEl) scrollingEl.scrollTop = 0;
      
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
    const rafId1 = requestAnimationFrame(forceScrollToTop);
    const rafId2 = requestAnimationFrame(() => requestAnimationFrame(forceScrollToTop));
    const timeoutId0 = setTimeout(forceScrollToTop, 0);
    const timeoutId1 = setTimeout(forceScrollToTop, 50);
    const timeoutId2 = setTimeout(forceScrollToTop, 150);
    
    return () => {
      cancelAnimationFrame(rafId1);
      cancelAnimationFrame(rafId2);
      clearTimeout(timeoutId0);
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [pathname, key]); // Include key to handle same-route navigations

  return null;
};

export default ScrollToTop;
