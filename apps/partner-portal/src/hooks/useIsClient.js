import { useState, useEffect } from 'react';

/**
 * Hook to determine if we're running on the client side
 * Critical for SSR safety to prevent hydration mismatches
 */
export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

/**
 * Hook for SSR-safe rendering of client-only components
 * @param {React.Component} ClientComponent - Component to render on client
 * @param {React.Component} ServerComponent - Component to render on server (optional)
 * @param {Object} props - Props to pass to components
 */
export const useSSRSafeComponent = (ClientComponent, ServerComponent = null, props = {}) => {
  const isClient = useIsClient();
  
  if (!isClient && ServerComponent) {
    return React.createElement(ServerComponent, props);
  }
  
  if (!isClient) {
    return null; // Don't render anything on server if no fallback provided
  }
  
  return React.createElement(ClientComponent, props);
};

export default useIsClient;

