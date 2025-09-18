// src/components/common/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const ScrollToTop = () => {
  // Use the scroll to top hook
  useScrollToTop();
  
  return null;
};

export default ScrollToTop;
