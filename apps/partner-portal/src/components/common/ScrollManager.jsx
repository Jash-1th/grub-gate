import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollManager
 * - Scrolls to top on normal route changes (no hash)
 * - Does NOT force scroll to top when a hash is present, allowing
 *   hash/section navigation to animate from the current position.
 */
const ScrollManager = () => {
  const location = useLocation();
  const lastKeyRef = useRef(null);

  useEffect(() => {
    // If this navigation explicitly asks to skip top scroll (hash nav), honor it
    const skipTop = location.state && location.state.skipScrollTop;

    // Only scroll to top when there is no hash and not explicitly skipped
    if (!location.hash && !skipTop) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
    // If there is a hash or skipTop is true, do nothing here; page logic can smooth scroll
  }, [location.pathname, location.search, location.hash, location.state]);

  return null;
};

export default ScrollManager;
