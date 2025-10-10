// FILE: src/components/ui/LoadingSpinner.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

/**
 * SSR-safe loading spinner component
 */
const LoadingSpinner = ({ 
  size = 'default', 
  text = 'Loading...', 
  className = '',
  showText = true,
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-6 w-6',
    large: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <FontAwesomeIcon icon={faSpinner} className={`animate-spin text-grub-red ${sizeClasses[size]}`} />
      {showText && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
