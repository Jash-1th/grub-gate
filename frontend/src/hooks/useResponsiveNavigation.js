import { useState, useEffect } from 'react';

/**
 * SSR-safe hook for responsive navigation
 * Returns default values during SSR and updates on client-side
 */
export const useResponsiveNavigation = () => {
  // Default to false during SSR and update on client
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted on client
    setIsMounted(true);
    
    // Only run on client
    const isClient = typeof window !== 'undefined';
    setIsClient(isClient);
    
    if (!isClient) return;
    
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Initial check
    checkIsMobile();

    // Add resize listener with debounce
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkIsMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Return default values during SSR and initial render
  if (!isMounted) {
    return {
      isMobile: false,
      isClient: false,
      isDesktop: false
    };
  }

  return {
    isMobile,
    isClient,
    isDesktop: isClient && !isMobile
  };
};
