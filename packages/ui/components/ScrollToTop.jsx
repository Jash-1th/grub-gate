import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Automatically scrolls to top when navigating between routes
 * Compatible with both SSR and client-side rendering
 */
const ScrollToTop = ({ 
  behavior = 'auto', // 'auto' | 'smooth'
  delay = 0,         // Delay in milliseconds before scrolling
  debug = false      // Enable debug logging
}) => {
  const { pathname, key, search, hash } = useLocation();

  // Use useLayoutEffect for client-side performance, useEffect for SSR compatibility
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
  
  useIsomorphicLayoutEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Debug logging
    if (debug) {
      console.log('🔄 ScrollToTop: Route changed to', pathname);
    }

    // Disable browser scroll restoration to prevent conflicts
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Function to perform the scroll
    const performScroll = () => {
      try {
        // Primary scroll methods
        if (behavior === 'smooth' && window.scrollTo) {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        } else {
          window.scrollTo(0, 0);
        }
        
        // Fallback methods for maximum compatibility
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Handle custom scroll containers (main content areas, modals, etc.)
        const scrollContainers = document.querySelectorAll([
          'main', 
          '.app-content', 
          '#root', 
          '[data-scroll="true"]',
          '.modal-body',
          '.overflow-auto',
          '.overflow-y-auto'
        ].join(', '));
        
        scrollContainers.forEach(container => {
          if (container && container.scrollTop > 0) {
            if (debug) {
              console.log('🔄 ScrollToTop: Scrolling container', container);
            }
            
            if (behavior === 'smooth' && container.scrollTo) {
              container.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            } else {
              container.scrollTop = 0;
              if (container.scrollTo) {
                container.scrollTo(0, 0);
              }
            }
          }
        });

        if (debug) {
          console.log('✅ ScrollToTop: Scroll completed');
        }
      } catch (error) {
        if (debug) {
          console.warn('⚠️ ScrollToTop: Error during scroll:', error);
        }
      }
    };

    // Execute scroll with optional delay
    if (delay > 0) {
      const timeoutId = setTimeout(performScroll, delay);
      return () => clearTimeout(timeoutId);
    } else {
      // Execute immediately in layout effect for synchronous scrolling
      performScroll();
      
      // Also schedule for next frame to handle any async content loading
      const frameId = requestAnimationFrame(() => {
        performScroll();
      });
      
      return () => cancelAnimationFrame(frameId);
    }
  }, [pathname, key, search, hash, behavior, delay, debug]);

  // This component renders nothing
  return null;
};

export default ScrollToTop;