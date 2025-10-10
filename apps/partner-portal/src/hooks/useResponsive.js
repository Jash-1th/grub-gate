import { useState, useEffect } from 'react';

/**
 * SSR-safe custom hook to detect responsive screen sizes
 * Returns boolean values for different breakpoints with proper SSR handling
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLarge: false,
    isXLarge: false,
    width: 0,
    height: 0,
    isClient: false
  });

  useEffect(() => {
    // Function to update screen size
    const updateScreenSize = () => {
      if (typeof window === 'undefined') return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        isMobile: width < 768,     // < md breakpoint
        isTablet: width >= 768 && width < 1024,  // md to lg
        isDesktop: width >= 1024,  // >= lg breakpoint
        isLarge: width >= 1280,    // >= xl breakpoint
        isXLarge: width >= 1536,   // >= 2xl breakpoint
        width,
        height,
        isClient: true
      });
    };

    // Set initial size
    updateScreenSize();

    // Add event listener with passive option for better performance
    window.addEventListener('resize', updateScreenSize, { passive: true });

    // Cleanup
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

/**
 * Hook specifically for mobile detection
 * Returns true if screen is mobile size
 */
export const useIsMobile = () => {
  const { isMobile } = useResponsive();
  return isMobile;
};

/**
 * Hook for tablet detection
 * Returns true if screen is tablet size
 */
export const useIsTablet = () => {
  const { isTablet } = useResponsive();
  return isTablet;
};

/**
 * Hook for desktop detection
 * Returns true if screen is desktop size or larger
 */
export const useIsDesktop = () => {
  const { isDesktop } = useResponsive();
  return isDesktop;
};

export default useResponsive;