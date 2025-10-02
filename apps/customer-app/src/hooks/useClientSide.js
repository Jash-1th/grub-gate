import { useState, useEffect } from 'react';

/**
 * Hook to detect if we're on the client side (browser)
 * This is useful for SSR-safe responsive behavior
 */
export const useClientSide = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

/**
 * Hook to get window dimensions in an SSR-safe way
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  const isClient = useClientSide();

  useEffect(() => {
    if (!isClient) return;

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Set initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  return windowSize;
};

/**
 * Hook to detect mobile screen size in an SSR-safe way
 */
export const useIsMobile = () => {
  const { width } = useWindowSize();
  const isClient = useClientSide();
  
  if (!isClient) return false; // Default to desktop for SSR
  
  return width < 768; // Tailwind's md breakpoint
};
