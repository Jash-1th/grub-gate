import { useState, useEffect, useRef } from 'react';

export const useIntersectionObserver = (options = { threshold: 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    // Only run on client-side to ensure SSR safety
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => {
      // We only want this to trigger once when element enters viewport
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Stop observing once animation is triggered to improve performance
        observer.unobserve(elementRef.current);
      }
    }, options);

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    // Cleanup function
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [options]);

  return [elementRef, isVisible];
};
