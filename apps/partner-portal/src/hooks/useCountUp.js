// Hook for animated counter effect
import { useState, useEffect } from 'react';

export const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime;
    const startValue = start;
    const endValue = end;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4); // Easing function
      
      const currentCount = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, start, hasStarted]);

  const startAnimation = () => setHasStarted(true);
  
  return { count, startAnimation };
};
