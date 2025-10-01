import { useEffect, useLayoutEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useScrollToTop Hook
 * Custom hook for automatic scroll-to-top functionality on route changes
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether scroll to top is enabled (default: true)
 * @param {string} options.behavior - Scroll behavior: 'auto' | 'smooth' (default: 'auto')
 * @param {number} options.delay - Delay in milliseconds before scrolling (default: 0)
 * @param {boolean} options.debug - Enable debug logging (default: false)
 * @param {Array<string>} options.ignorePaths - Paths to ignore for scroll-to-top (default: [])
 * @param {Array<string>} options.customSelectors - Additional selectors for scroll containers (default: [])
 * @returns {Function} Manual scroll to top function
 */
export const useScrollToTop = (options = {}) => {
  const {
    enabled = true,
    behavior = 'auto',
    delay = 0,
    debug = false,
    ignorePaths = [],
    customSelectors = []
  } = options;

  const location = useLocation();

  // Use useLayoutEffect for client-side performance, useEffect for SSR compatibility
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  // Manual scroll to top function
  const scrollToTop = useCallback((manualBehavior = behavior, manualDelay = 0) => {
    if (typeof window === 'undefined') return;

    const performScroll = () => {
      try {
        // Primary scroll methods
        if (manualBehavior === 'smooth' && window.scrollTo) {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        } else {
          window.scrollTo(0, 0);
        }
        
        // Fallback methods for maximum compatibility
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Default scroll containers
        const defaultSelectors = [
          'main', 
          '.app-content', 
          '#root', 
          '[data-scroll="true"]',
          '.modal-body',
          '.overflow-auto',
          '.overflow-y-auto'
        ];

        // Combine default and custom selectors
        const allSelectors = [...defaultSelectors, ...customSelectors];
        const scrollContainers = document.querySelectorAll(allSelectors.join(', '));
        
        scrollContainers.forEach(container => {
          if (container && container.scrollTop > 0) {
            if (debug) {
              console.log('🔄 useScrollToTop: Scrolling container', container);
            }
            
            if (manualBehavior === 'smooth' && container.scrollTo) {
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
          console.log('✅ useScrollToTop: Manual scroll completed');
        }
      } catch (error) {
        if (debug) {
          console.warn('⚠️ useScrollToTop: Error during manual scroll:', error);
        }
      }
    };

    if (manualDelay > 0) {
      setTimeout(performScroll, manualDelay);
    } else {
      performScroll();
    }
  }, [behavior, debug, customSelectors]);

  // Set up scroll restoration settings on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // Auto scroll on route changes
  useIsomorphicLayoutEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Check if current path should be ignored
    const shouldIgnore = ignorePaths.some(ignorePath => {
      if (typeof ignorePath === 'string') {
        return location.pathname === ignorePath;
      }
      if (ignorePath instanceof RegExp) {
        return ignorePath.test(location.pathname);
      }
      return false;
    });

    if (shouldIgnore) {
      if (debug) {
        console.log('🚫 useScrollToTop: Ignoring path', location.pathname);
      }
      return;
    }

    if (debug) {
      console.log('🔄 useScrollToTop: Auto-scrolling for route', location.pathname);
    }

    // Execute scroll with optional delay
    if (delay > 0) {
      const timeoutId = setTimeout(() => scrollToTop(behavior, 0), delay);
      return () => clearTimeout(timeoutId);
    } else {
      // Execute immediately
      scrollToTop(behavior, 0);
      
      // Also schedule for next frame to handle any async content loading
      const frameId = requestAnimationFrame(() => {
        scrollToTop(behavior, 0);
      });
      
      return () => cancelAnimationFrame(frameId);
    }
  }, [
    location.pathname, 
    location.key, 
    location.search, 
    location.hash,
    enabled,
    behavior,
    delay,
    debug,
    ignorePaths,
    scrollToTop
  ]);

  return scrollToTop;
};

export default useScrollToTop;