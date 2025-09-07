// src/components/common/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Extracts pathname property from the current location object
  const { pathname } = useLocation();

  // This effect runs every time the pathname changes
  useEffect(() => {
    // The window.scrollTo command is a browser-only API. 
    // useEffect ensures this code only runs on the client, after the component mounts.
    window.scrollTo(0, 0);
  }, [pathname]); // Dependency array with pathname ensures it runs on route change

  return null; // This component does not render anything
};

export default ScrollToTop;
