// FILE: src/components/ui/ErrorMessage.jsx
import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '@grub-gate/ui';

/**
 * SSR-safe error message component
 */
const ErrorMessage = ({ 
  error, 
  onRetry, 
  onDismiss,
  title = 'Something went wrong',
  className = '',
  showRetry = true,
  showDismiss = false
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message || 'An unexpected error occurred';

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            {title}
          </h3>
          <p className="text-sm text-red-700 break-words">
            {errorMessage}
          </p>
          
          {(showRetry || showDismiss) && (
            <div className="mt-3 flex items-center space-x-2">
              {showRetry && onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              )}
              
              {showDismiss && onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="text-red-600 hover:bg-red-100"
                >
                  <X className="h-3 w-3 mr-1" />
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
        
        {showDismiss && onDismiss && (
          <div className="flex-shrink-0">
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
