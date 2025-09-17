import { useState, useEffect } from 'react';

/**
 * SSR-safe hook for responsive navigation
 * Always returns false initially to prevent hydration mismatches
 * Updates to true after client-side hydration
 */
export const useResponsiveNavigation = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side after hydration
    setIsClient(true);
    
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Check on mount
    checkIsMobile();

    // Add resize listener
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return {
    isMobile,
    isClient,
    isDesktop: isClient && !isMobile
  };
};
