// FILE: apps/customer-app/src/components/common/ErrorDisplay.jsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationCircle, 
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

/**
 * Reusable error display component with different severity levels
 * Matches Joi validation error styling and provides consistent UX
 */
const ErrorDisplay = ({ 
  error, 
  errors = {}, 
  field = null, 
  type = 'error', 
  className = '',
  showIcon = true,
  size = 'sm'
}) => {
  // Determine what to display
  let message = '';
  let displayType = type;

  if (field && errors[field]) {
    // Display specific field error
    message = errors[field];
    displayType = 'error';
  } else if (error) {
    // Display general error
    message = error;
  } else if (errors.general) {
    // Display general form error
    message = errors.general;
    displayType = 'error';
  }

  // Don't render if no message
  if (!message) return null;

  // Style configurations based on type
  const typeStyles = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-700',
      icon: faExclamationCircle,
      iconColor: 'text-red-500'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      icon: faExclamationTriangle,
      iconColor: 'text-yellow-500'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-700',
      icon: faInfoCircle,
      iconColor: 'text-blue-500'
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-700',
      icon: faCheckCircle,
      iconColor: 'text-green-500'
    }
  };

  // Size configurations
  const sizeStyles = {
    xs: {
      container: 'p-2 text-xs',
      icon: 'h-3 w-3'
    },
    sm: {
      container: 'p-3 text-sm',
      icon: 'h-4 w-4'
    },
    md: {
      container: 'p-4 text-base',
      icon: 'h-5 w-5'
    },
    lg: {
      container: 'p-5 text-lg',
      icon: 'h-6 w-6'
    }
  };

  const currentTypeStyle = typeStyles[displayType] || typeStyles.error;
  const currentSizeStyle = sizeStyles[size] || sizeStyles.sm;

  return (
    <div className={`
      border rounded-lg flex items-start space-x-2
      ${currentTypeStyle.container}
      ${currentSizeStyle.container}
      ${className}
    `}>
      {showIcon && (
        <FontAwesomeIcon 
          icon={currentTypeStyle.icon}
          className={`
            ${currentTypeStyle.iconColor}
            ${currentSizeStyle.icon}
            mt-0.5 flex-shrink-0
          `}
        />
      )}
      <div className="flex-1">
        {typeof message === 'string' ? (
          <p className="leading-relaxed">{message}</p>
        ) : (
          <div>{message}</div>
        )}
      </div>
    </div>
  );
};

/**
 * Field-specific error display component
 * Used for individual form field validation errors
 */
export const FieldError = ({ 
  error, 
  errors = {}, 
  field, 
  className = '',
  showIcon = true 
}) => {
  const fieldError = field && errors[field] ? errors[field] : error;
  
  if (!fieldError) return null;

  return (
    <div className={`mt-1 flex items-center space-x-1 ${className}`}>
      {showIcon && (
        <FontAwesomeIcon 
          icon={faExclamationCircle}
          className="h-3 w-3 text-red-500 flex-shrink-0"
        />
      )}
      <p className="text-sm text-red-600 leading-relaxed">{fieldError}</p>
    </div>
  );
};

/**
 * Multiple errors display component
 * Used for displaying multiple validation errors at once
 */
export const ErrorList = ({ 
  errors = {}, 
  className = '',
  title = 'Please fix the following errors:',
  showTitle = true
}) => {
  const errorFields = Object.keys(errors).filter(key => errors[key] && key !== 'general');
  
  if (errorFields.length === 0 && !errors.general) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      {showTitle && (
        <div className="flex items-center space-x-2 mb-3">
          <FontAwesomeIcon 
            icon={faExclamationCircle}
            className="h-5 w-5 text-red-500"
          />
          <h4 className="text-sm font-medium text-red-800">{title}</h4>
        </div>
      )}
      
      {errors.general && (
        <p className="text-sm text-red-700 mb-2">{errors.general}</p>
      )}
      
      {errorFields.length > 0 && (
        <ul className="space-y-1">
          {errorFields.map(field => (
            <li key={field} className="text-sm text-red-700 flex items-start space-x-2">
              <span className="text-red-500 mt-1">•</span>
              <span>
                <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
                {' '}
                {errors[field]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Success message component
 * Used for positive feedback and confirmations
 */
export const SuccessDisplay = ({ 
  message, 
  className = '',
  showIcon = true,
  size = 'sm'
}) => {
  if (!message) return null;

  return (
    <ErrorDisplay
      error={message}
      type="success"
      className={className}
      showIcon={showIcon}
      size={size}
    />
  );
};

/**
 * Warning message component
 * Used for non-critical alerts and warnings
 */
export const WarningDisplay = ({ 
  message, 
  className = '',
  showIcon = true,
  size = 'sm'
}) => {
  if (!message) return null;

  return (
    <ErrorDisplay
      error={message}
      type="warning"
      className={className}
      showIcon={showIcon}
      size={size}
    />
  );
};

/**
 * Info message component
 * Used for helpful information and tips
 */
export const InfoDisplay = ({ 
  message, 
  className = '',
  showIcon = true,
  size = 'sm'
}) => {
  if (!message) return null;

  return (
    <ErrorDisplay
      error={message}
      type="info"
      className={className}
      showIcon={showIcon}
      size={size}
    />
  );
};

export default ErrorDisplay;
