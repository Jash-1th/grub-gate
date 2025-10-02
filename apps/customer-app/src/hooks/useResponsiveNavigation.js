import { useState, useEffect, useCallback } from 'react';

/**
 * SSR-safe hook for responsive navigation
 * 
 * @returns {Object} - Contains responsive state values
 * @property {boolean} isMobile - True if viewport is mobile size (< 768px)
 * @property {boolean} isDesktop - True if viewport is desktop size (≥ 768px)
 * @property {boolean} isClient - True when running on the client side
 */
export const useResponsiveNavigation = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Memoize the check to prevent unnecessary re-renders
  const checkIsMobile = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768; // md breakpoint
  }, []);

  useEffect(() => {
    // Set initial client state
    const client = typeof window !== 'undefined';
    setIsClient(client);
    
    if (!client) return;
    
    // Set initial mobile state
    setIsMobile(checkIsMobile());

    // Debounce resize handler
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsMobile(checkIsMobile());
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkIsMobile]);

  return {
    isMobile,
    isClient,
    isDesktop: isClient && !isMobile
  };
};

// Export a default instance for convenience
export default useResponsiveNavigation;
