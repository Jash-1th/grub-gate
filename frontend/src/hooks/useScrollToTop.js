import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
  const { pathname, search } = useLocation();
  
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    // Disable browser's default scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // Function to handle scroll to top
    const scrollToTop = () => {
      try {
        // Try scrolling the window
        window.scrollTo(0, 0);
        
        // Also try scrolling the document element
        const root = document.documentElement || document.body;
        root.scrollTo(0, 0);
        
        // Force scroll to top by setting scrollTop on all scrollable elements
        document.querySelectorAll('html, body, #root, main, [data-scrollable]').forEach(el => {
          try {
            el.scrollTop = 0;
          } catch (e) {
            console.warn('Failed to reset scroll on element:', el, e);
          }
        });
      } catch (error) {
        console.warn('Scroll to top failed:', error);
      }
    };
    
    // Initial scroll to top
    scrollToTop();
    
    // Add a small delay and try again to ensure it sticks
    const timer1 = setTimeout(scrollToTop, 50);
    const timer2 = setTimeout(scrollToTop, 200);
    
    // Cleanup
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname, search]);
};
