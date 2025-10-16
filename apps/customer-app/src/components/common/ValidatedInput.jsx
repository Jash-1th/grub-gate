// FILE: apps/customer-app/src/components/common/ValidatedInput.jsx

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faEyeSlash, 
  faCheck, 
  faExclamationCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { validateField } from '../../utils/validationErrorHandler';
import { FieldError } from './ErrorDisplay';

/**
 * Enhanced input component with built-in validation
 * Matches Joi schema validation rules and provides real-time feedback
 */
const ValidatedInput = ({
  // Basic input props
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  required = false,
  autoComplete,
  className = '',
  
  // Label and help text
  label,
  helpText,
  showRequired = true,
  
  // Validation props
  validationRules = {},
  errors = {},
  showValidIcon = false,
  validateOnChange = false,
  validateOnBlur = true,
  debounceMs = 300,
  
  // Styling props
  size = 'md',
  variant = 'default',
  
  // Special input types
  showPasswordToggle = false,
  maxLength,
  
  // Loading state
  loading = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [validationTimeout, setValidationTimeout] = useState(null);

  // Determine if this is a password field
  const isPasswordField = type === 'password' || showPasswordToggle;
  const inputType = isPasswordField && showPassword ? 'text' : type;

  // Get current error (local validation or prop error)
  const currentError = errors[name] || localError;
  const hasError = Boolean(currentError);

  // Size configurations
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  // Variant configurations
  const variantStyles = {
    default: `
      border border-gray-300 rounded-lg
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      disabled:bg-gray-50 disabled:text-gray-500
    `,
    filled: `
      border-0 bg-gray-100 rounded-lg
      focus:ring-2 focus:ring-blue-500 focus:bg-white
      disabled:bg-gray-200 disabled:text-gray-500
    `,
    underlined: `
      border-0 border-b-2 border-gray-300 rounded-none
      focus:ring-0 focus:border-blue-500
      disabled:bg-transparent disabled:text-gray-500
    `
  };

  // Validation function
  const validateInput = async (inputValue) => {
    if (!validationRules || Object.keys(validationRules).length === 0) {
      return;
    }

    setIsValidating(true);
    
    try {
      const error = validateField(name, inputValue, validationRules);
      setLocalError(error);
      setIsValid(!error && inputValue && inputValue.toString().trim() !== '');
    } catch (err) {
      console.error('Validation error:', err);
      setLocalError('Validation failed');
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  // Debounced validation effect
  useEffect(() => {
    if (!isTouched || (!validateOnChange && !validateOnBlur)) return;

    // Clear previous timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    // Set new timeout for validation
    const timeoutId = setTimeout(() => {
      validateInput(value);
    }, debounceMs);

    setValidationTimeout(timeoutId);

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [value, isTouched, validateOnChange, validateOnBlur, debounceMs]);

  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Clear errors when user starts typing
    if (currentError) {
      setLocalError(null);
    }
    
    if (onChange) {
      onChange(e);
    }

    // Validate on change if enabled
    if (validateOnChange && isTouched) {
      validateInput(newValue);
    }
  };

  // Handle input blur
  const handleBlur = (e) => {
    setIsTouched(true);
    
    if (onBlur) {
      onBlur(e);
    }

    // Validate on blur if enabled
    if (validateOnBlur) {
      validateInput(e.target.value);
    }
  };

  // Determine input styling based on state
  const getInputStyling = () => {
    let styling = `
      w-full transition-colors duration-200
      ${sizeStyles[size]}
      ${variantStyles[variant]}
    `;

    if (hasError) {
      styling += ' border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500';
    } else if (isValid && showValidIcon) {
      styling += ' border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500';
    }

    return styling;
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && showRequired && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        <input
          type={inputType}
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || loading}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={`
            ${getInputStyling()}
            ${isPasswordField || showValidIcon || isValidating ? 'pr-10' : ''}
          `}
        />

        {/* Right-side icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
          {/* Loading spinner */}
          {(loading || isValidating) && (
            <FontAwesomeIcon 
              icon={faSpinner}
              className="h-4 w-4 text-gray-400 animate-spin"
            />
          )}

          {/* Validation icon */}
          {!loading && !isValidating && showValidIcon && isValid && !hasError && (
            <FontAwesomeIcon 
              icon={faCheck}
              className="h-4 w-4 text-green-500"
              title="Valid"
            />
          )}

          {/* Error icon */}
          {!loading && !isValidating && hasError && (
            <FontAwesomeIcon 
              icon={faExclamationCircle}
              className="h-4 w-4 text-red-500"
              title="Error"
            />
          )}

          {/* Password toggle */}
          {isPasswordField && !loading && !isValidating && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              <FontAwesomeIcon 
                icon={showPassword ? faEyeSlash : faEye}
                className="h-4 w-4"
              />
            </button>
          )}
        </div>
      </div>

      {/* Character count */}
      {maxLength && (
        <div className="text-xs text-gray-500 text-right">
          {(value || '').length}/{maxLength}
        </div>
      )}

      {/* Error message */}
      <FieldError 
        error={currentError}
        field={name}
        errors={errors}
      />

      {/* Help text */}
      {helpText && !currentError && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

/**
 * Textarea component with validation
 */
export const ValidatedTextarea = ({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  label,
  helpText,
  showRequired = true,
  validationRules = {},
  errors = {},
  rows = 3,
  maxLength,
  loading = false
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [localError, setLocalError] = useState(null);

  const currentError = errors[name] || localError;
  const hasError = Boolean(currentError);

  const handleChange = (e) => {
    if (currentError) {
      setLocalError(null);
    }
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e) => {
    setIsTouched(true);
    if (onBlur) {
      onBlur(e);
    }

    // Basic validation
    if (validationRules.required && (!value || value.trim() === '')) {
      setLocalError(`${label || name} is required`);
    } else if (validationRules.maxLength && value && value.length > validationRules.maxLength) {
      setLocalError(`${label || name} cannot exceed ${validationRules.maxLength} characters`);
    } else {
      setLocalError(null);
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && showRequired && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled || loading}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 border rounded-lg resize-vertical transition-colors duration-200
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          ${hasError 
            ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
          }
        `}
      />

      {maxLength && (
        <div className="text-xs text-gray-500 text-right">
          {(value || '').length}/{maxLength}
        </div>
      )}

      <FieldError 
        error={currentError}
        field={name}
        errors={errors}
      />

      {helpText && !currentError && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

/**
 * Select component with validation
 */
export const ValidatedSelect = ({
  name,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  className = '',
  label,
  helpText,
  showRequired = true,
  validationRules = {},
  errors = {},
  options = [],
  placeholder = 'Select an option',
  loading = false
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [localError, setLocalError] = useState(null);

  const currentError = errors[name] || localError;
  const hasError = Boolean(currentError);

  const handleChange = (e) => {
    if (currentError) {
      setLocalError(null);
    }
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e) => {
    setIsTouched(true);
    if (onBlur) {
      onBlur(e);
    }

    // Basic validation
    if (validationRules.required && (!value || value === '')) {
      setLocalError(`${label || name} is required`);
    } else {
      setLocalError(null);
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && showRequired && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled || loading}
        required={required}
        className={`
          w-full px-4 py-3 border rounded-lg transition-colors duration-200
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          ${hasError 
            ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
          }
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option 
            key={option.value || option} 
            value={option.value || option}
          >
            {option.label || option}
          </option>
        ))}
      </select>

      <FieldError 
        error={currentError}
        field={name}
        errors={errors}
      />

      {helpText && !currentError && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

export default ValidatedInput;
